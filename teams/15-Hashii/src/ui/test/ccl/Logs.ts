/**
 * @copyright © 2020 Copyright ccl
 * @date 2020-12-08
 */

import {TransactionReceipt} from 'web3z';
import {Primitive,Bytes32,Address} from './Primitive';

import * as json from './Logs.json';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = '0xc4656Af35c4af2A582D94fca096aAe6228166f45';

export type Writer = [Address/*address*/, number/*timestamp*/];

/**
 * 日志数据
 */
export default interface Logs extends Primitive {

	/**
	 * 检查日志
	 */
	get(hash: Bytes32): Promise<Writer>;

	/**
	 * 安全添加数据日志，同时通过签名获取签名者，用这个签名者来验证数据
	 */
	setHash(hash: Bytes32, sigR: Bytes32, sigS: Bytes32, sigV: number): Promise<TransactionReceipt>;

}