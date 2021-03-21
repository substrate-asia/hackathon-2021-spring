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
import { logger } from '@polkadot/util';

import Order from '../models/Order';
import OrderRefund from '../models/OrderRefund';
import PolkadotWsApi from '../polkadot/init';
import { OrderStatus, ReturnStatus } from '../polkadot/types';
import { dberr } from '../utils/webx';

const l = logger('polkadot');

const ex = function (err:Error) {
	l.error('catch unknown exception: ', err);
	return err;
};

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

export async function watcher (): Promise<unknown> {
	return new Promise((resolve, reject) => {
		if (!polkadotApi.api) {
			throw new Error('polkadot ws api creating');
		}
		polkadotApi.api.then(async api => {
			l.log('Api Connecte State: ', api.isConnected);
			api.once('error', e => {
				api.disconnect().catch(ex);
				l.error('Api error: ', e);
			});

			api.once('disconnected', e => {
				api.disconnect().catch(ex);
				l.error('Api disconnected: ', e);
			});

			while (true) {
				const paramIndex = (await api.derive.chain.bestNumberFinalized()).toNumber();
				const { bestFinalizedBlock, unsub } = await waitFinalized(
					api,
					paramIndex
				);
				unsub && unsub();
				console.log('best height: ', bestFinalizedBlock);
				await clearOrder(api, bestFinalizedBlock).catch(dberr);
				await clearOrderRefund(api, bestFinalizedBlock).catch(dberr);
			}
		}).catch(e => {
			l.error('Connection error: ', e);
			reject(e);
		});
	});
}

async function clearOrder (api:ApiPromise, index: number):Promise<boolean> {
	const limit = 20;
	let offset = 0;
	while (true) {
		const result = await Order.query().whereNotIn('onchain_status', [OrderStatus.Closed, OrderStatus.Archived]).where('block_index', '>', 0).where('block_index', '<', index - 100).offset(offset).limit(limit).catch(dberr);
		if (!result || result.length === 0) {
			break;
		}
		for (let i = 0; i < result.length; i++) {
			const item = result[i];
			// construct the transaction, exactly as per normal
			const utx = api.tx.commissionedShopping.clearShoppingOrder(item.ext_order_hash);
			// send it without calling sign, pass callback with status/events
			utx.send().catch(err => {
				const msg = new Error(err).message;
				if (msg.indexOf('Custom error: 4') !== -1 || msg.indexOf('Transaction is temporarily banned') !== -1) {
					l.error('clearShoppingOrder-------', msg);
				}
			});
		}
		offset += limit;
	}
	return new Promise(resolve => { resolve(true); });
}

async function clearOrderRefund (api:ApiPromise, index: number):Promise<boolean> {
	const limit = 20;
	let offset = 0;
	while (true) {
		const result = await OrderRefund.query().whereNotIn('onchain_status', [ReturnStatus.Closed, ReturnStatus.Archived]).where('block_index', '>', 0).where('block_index', '<', index - 100).offset(offset).limit(limit).catch(dberr);
		if (!result || result.length === 0) {
			break;
		}
		for (let i = 0; i < result.length; i++) {
			const item = result[i];
			// construct the transaction, exactly as per normal
			const utx = api.tx.commissionedShopping.ClearCommodityReturn(item.ext_order_hash);
			// send it without calling sign, pass callback with status/events
			utx.send().catch(err => {
				const msg = new Error(err).message;
				if (msg.indexOf('Custom error: 4') !== -1 || msg.indexOf('Transaction is temporarily banned') !== -1) {
					l.error('clearOrderRefund-------', msg);
				}
			});
		}
		offset += limit;
	}
	return new Promise(resolve => { resolve(true); });
}
