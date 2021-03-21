/*
 * Copyright (C) 2017-2021 blocktree.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApiPromise } from '@polkadot/api';
import { getSpecTypes } from '@polkadot/types-known';
import { Hash } from '@polkadot/types/interfaces';
import { logger } from '@polkadot/util';

import BizException from '../exceptions/BizException';
import Block from '../models/Block';
import msg from '../utils/messages';
import PolkadotWsApi from './init';
import { conditionAccept, handleEvent, OrderEvent, TaskResult } from './types';

const l = logger('polkadot');

const concurrent = Number(process.env.POLKADOT_WATCHER) || 10;

const ex = function (err:Error) {
	l.error('catch unknown exception: ', err);
	return err;
};

let spec_exired = new Date().getTime();

function waitFinalized (
	api: ApiPromise,
	lastKnownBestFinalized: number
): Promise<{ unsub: () => void; bestFinalizedBlock: number }> {
	return new Promise((resolve, reject) => {
		async function wait (): Promise<void> {
			const unsub = await api.derive.chain.bestNumberFinalized(best => {
				if (best.toNumber() > lastKnownBestFinalized) {
					resolve({ bestFinalizedBlock: best.toNumber(), unsub });
				}
			});
		}
		wait().catch(err => { reject(err); });
	});
}

const polkadotApi = new PolkadotWsApi();

async function checkSpecVersion (api: ApiPromise, blockIndex: number): Promise<boolean> {
	// get hash
	const blockHash: Hash = await api.rpc.chain.getBlockHash(api.createType('BlockNumber', blockIndex));
	// check spec version
	const runtimeVersion = await api.rpc.state.getRuntimeVersion(blockHash);
	const newSpecVersion = runtimeVersion.specVersion;

	let currentSpecVersion = api.createType('u32', 0);

	if (newSpecVersion.gt(currentSpecVersion)) {
		const rpcMeta = await api.rpc.state.getMetadata(blockHash);
		// l.warn('bumped spec version to, fetching new metadata', newSpecVersion);
		currentSpecVersion = newSpecVersion;
		const chain = await api.rpc.system.chain();
		api.registry.register(
			getSpecTypes(
				api.registry,
				chain,
				runtimeVersion.specName,
				runtimeVersion.specVersion
			)
		);
		api.registry.setMetadata(rpcMeta);
	}
	return Promise.resolve(true);
}

async function getSafeBlockHash (api: ApiPromise, blockIndex: number):Promise<Hash> {
	try {
		const blockHash: Hash = await api.rpc.chain.getBlockHash(api.createType('BlockNumber', blockIndex));
		return Promise.resolve(blockHash);
	} catch (err) {
		const errmsg = new Error(err).message;
		if (errmsg.indexOf('createType(BlockHash)') !== -1) {
			await checkSpecVersion(api, blockIndex);
			const blockHash: Hash = await api.rpc.chain.getBlockHash(api.createType('BlockNumber', blockIndex));
			return Promise.resolve(blockHash);
		}
		return Promise.reject(err);
	}
}

export async function watcher (): Promise<unknown> {
	return new Promise((resolve, reject) => {
		if (!polkadotApi.api) {
			throw new Error('polkadot ws api creating');
		}
		let active = true;
		polkadotApi.api.then(async api => {
			l.log('Api Connecte State: ', api.isConnected);
			api.once('error', e => {
				active = false;
				api.disconnect().catch(ex);
				l.error('Api error: ', e);
			});

			api.once('disconnected', e => {
				active = false;
				api.disconnect().catch(ex);
				l.error('Api disconnected: ', e);
			});

			let blockIndex = 0;

			const lastBlockIndex = await Block.query().orderBy('id', 'desc').first().catch(dberr);

			if (lastBlockIndex) {
				blockIndex = lastBlockIndex.id;
				l.log(datestr(), 'last block height: ', blockIndex);
			} else {
				l.log(datestr(), 'last block height not found: ', blockIndex);
			}

			// eslint-disable-next-line no-unmodified-loop-condition
			while (active) {
				// 获取当前确认高度
				let paramIndex = (await api.derive.chain.bestNumberFinalized()).toNumber();

				const { bestFinalizedBlock, unsub } = await waitFinalized(
					api,
					paramIndex
				);

				unsub && unsub();

				if (new Date().getTime() >= spec_exired) {
					await checkSpecVersion(api, blockIndex);
					spec_exired += Number(process.env.POLKADOT_SPEC_EXPIRED) || 1800000;
					l.log(datestr(), 're-registered-spec');
				}

				blockIndex = blockIndex === 0 || blockIndex > bestFinalizedBlock ? bestFinalizedBlock : blockIndex;

				// 获取重扫高度
				const reScan = getReScanHeight();

				// 获取高度差值
				const diff = bestFinalizedBlock - blockIndex > concurrent ? concurrent : bestFinalizedBlock - blockIndex;

				// 如果当前区块索引小于最大确认高度或重扫高度不为空
				while (blockIndex < bestFinalizedBlock || reScan.length > 0) {
					try {
						// 任务列表对象
						const taskArray = [];
						// 优先填充重扫高度
						if (reScan.length > 0) {
							l.log(datestr(), 'get rescan height: ', reScan);
							for (let i = 0; i < reScan.length; i++) {
								taskArray.push(buildTask(api, reScan[i], bestFinalizedBlock).catch(err => {
									throw new BizException(msg.TASK_ERR, 'watch failed height: ' + (reScan[i]).toString() + ', ' + new Error(err).message);
								}));
							}
						} else {
							// 生成运行自然扫任务列表
							for (let i = 0; i < diff; i++) {
								taskArray.push(buildTask(api, blockIndex + i, bestFinalizedBlock).catch(err => {
									throw new BizException(msg.TASK_ERR, 'watch failed height: ' + (blockIndex + i).toString() + ', ' + new Error(err).message);
								}));
							}
						}
						// 并行运行任务列表
						const taskResultArr = await runTask(taskArray);
						if (!taskResultArr || taskResultArr.length !== diff) {
							l.error(datestr(), 'task not complete: ', taskResultArr.length, ', target: ', diff);
							continue;
						}
						// 处理订单事件列表
						handleOrderEvents(taskResultArr);
						// 清空重扫高度列表
						if (reScan.length > 0) {
							delReScanHeight(reScan);
							break;
						}
						// 增加区块索引
						blockIndex += diff;
						paramIndex = blockIndex;
						// 保留最新1000区块
						await Block.query().delete().where('id', '<', blockIndex - 1000).catch(dberr);
					} catch (err) {
						if (err instanceof BizException) {
							l.error(err);
							continue;
						} else {
							if (new Error(err).message.indexOf('-32603:') !== -1) {
								l.error(datestr(), 'unknown block height: ', blockIndex, ' max block height: ', bestFinalizedBlock);
							} else {
								throw err;
							}
						}
					}
				}
			}
		}).catch(e => {
			active = false;
			l.error(datestr(), 'Connection error: ', e);
			reject(e);
		});
	});
}

function handleOrderEvents (taskResultArr: TaskResult[]):void {
	for (let i = 0; i < taskResultArr.length; i++) {
		const events = taskResultArr[i].orderEvents;
		for (let j = 0; j < events.length; j++) {
			handleEvent(events[j]).catch(err => { l.error('event failed: ', err); });
		}
	}
}

async function runTask (tasks: Promise<TaskResult>[]):Promise<TaskResult[]> {
	const result = await Promise.all(tasks).catch(err => { throw err; });
	const sortby = result.sort((n1, n2) => {
		if (n1.blockIndex > n2.blockIndex) {
			return 1;
		}
		if (n1.blockIndex < n2.blockIndex) {
			return -1;
		}
		return 0;
	});
	sortby.forEach(item => {
		l.warn(datestr(), ' ---- current height && hash: ', item.blockIndex, item.blockHash, ' finalizedHeight: ', item.bestFinalizedIndex);
	});
	return sortby;
}

async function buildTask (api:ApiPromise, blockIndex: number, bestFinalizedIndex: number):Promise<TaskResult> {
	// get hash
	const blockHash = await getSafeBlockHash(api, blockIndex);
	// get prev hash
	const prevHash = await getSafeBlockHash(api, blockIndex - 1);

	const events = await Promise.all([
		await api.query.system.events.at(blockHash)
	]);
	const orderEvents: OrderEvent[] = [];
	if (events) {
		for (let i = 0; i < events.length; i++) {
			const evti = events[i];
			for (let j = 0; j < evti.length; j++) {
				const event = evti[j].event;
				const codc = event.data.toArray();
				const codc_s:string[] = [];
				for (let k = 0; k < codc.length; k++) {
					codc_s.push(codc[k].toString());
				}
				const orderEvent = conditionAccept(blockIndex, event.section, event.method, codc_s);
				if (!orderEvent) {
					continue;
				}
				orderEvents.push(orderEvent);
			}
		}
	}
	const block = await Block.query().where('id', blockIndex).first().catch(dberr);
	if (!block) {
		await Block.query()
			.insert({
				ctime: new Date().getTime(),
				hash: blockHash.toString(),
				id: blockIndex,
				prev: prevHash.toString(),
				utime: 0
			}).catch(dberr);
	}
	return new Promise<TaskResult>((resolve) => {
		resolve(new TaskResult(blockIndex, blockHash.toString(), prevHash.toString(), bestFinalizedIndex, orderEvents));
	});
}

function getReScanHeight (): number[] {
	// 数据库加载重扫高度列表 152420
	return [];
}

function delReScanHeight (reScan: number[]): void {
	// 清空数据库重扫高度列表
	l.log(datestr(), 'del rescan height: ', reScan);
}

const dberr = function (err: Error): void {
	throw new BizException(msg.BIZ_ERR, err.message);
};

function datestr () {
	const oDate = new Date();
	const oYear = oDate.getFullYear();
	const oMonth = oDate.getMonth() + 1;
	const oDay = oDate.getDate();
	const oHour = oDate.getHours();
	const oMin = oDate.getMinutes();
	const oSen = oDate.getSeconds();
	const oTime = oYear.toString() + '-' + fmtstr(oMonth) + '-' + fmtstr(oDay) + ' ' + fmtstr(oHour) + ':' + fmtstr(oMin) + ':' + fmtstr(oSen);
	return oTime;
}
function fmtstr (num: number): string {
	if (num < 10) {
		return '0' + num.toString();
	}
	return num.toString();
}
