/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-05
 */

import {TransactionPromise} from 'web3z';
import {Address,Uint256, Uint16} from 'web3z/solidity_types';
import * as json from './VotePool.json';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = '0x5D22F214F6eB56B2928269472EB59AdAC4b90ea3';

//投票质押信息，用于记录每一张投票信息
export interface Vote {
	// 投票人
	voter: Address;
	// 所参与的竞拍活动
	orderId: Uint256;
	//投票质押数量
	votes: Uint256;
	//投票质押系数
	weight: Uint256;
	// 投票区块搞定
	blockNumber: Uint256;
}

// 竞拍活动的投票质押信息总览
export interface OrderSummary {
	totalVotes: Uint256;
	totalCanceledVotes: Uint256;
	totalShares: Uint256;
	commission: Uint256;
	stoped: boolean;
}

export default interface VotePool {
	owner(): Promise<Address>;
	initialize(admin: Address): TransactionPromise;
	renounceOwnership(): TransactionPromise;
	transferOwnership(): TransactionPromise;
	MAX_PENDING_VOTES(): Promise<Uint256>;
	MAX_WEIGTH(): Promise<Uint256>;
	MIN_WEIGTH(): Promise<Uint256>;
	VOTE_LOCKTIMES(): Promise<Uint256>;
	Voteing(): Promise<Uint256>;
	exchange(): Promise<Address>;
	lastVoteId(): Promise<Uint256>;
	ledger(): Promise<Address>;
	ordersById(id: Uint256): Promise<OrderSummary>;
	votesById(id: Uint256): Promise<Vote>;
	// votesByVoter(account: Address, _: Uint256): Promise<Uint256[]>;
	init(exchange_: Address, ledger_: Address): TransactionPromise;
	marginVote(orderId: Uint256): TransactionPromise;
	cancelVote(voteId: Uint256): TransactionPromise;
	subCommission(orderId: Uint256): TransactionPromise;
	settle(holder: Address): TransactionPromise;
	orderTotalVotes(orderId: Uint256): Promise<Uint256>;
	canRelease(holder: Address): Promise<Uint256>;
	tryRelease(holder: Address): TransactionPromise;
	unlockAllowed(voteId: Uint256, voter: Address): Promise<boolean>;
	allVotes(voter: Address): Promise<Uint256[]>;
}