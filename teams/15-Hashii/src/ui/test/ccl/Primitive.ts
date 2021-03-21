/**
 * @copyright © 2020 Copyright ccl
 * @date 2020-12-08
 */

import {TransactionReceipt} from 'web3z';
import {Address} from 'web3z/solidity_types';

export * from 'web3z/solidity_types';

export interface Primitive {
	owner(): Promise<Address>;
	isRunning(): Promise<boolean>; // 合约是否被作废
	destroy(): Promise<TransactionReceipt>;
	setOwner(address: Address): Promise<TransactionReceipt>;
}
