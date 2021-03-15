/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-04
 */

import {TransactionPromise} from 'web3z';
import {Address,Uint256,Bytes} from 'web3z/solidity_types';
import * as json from './Exchange.json';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = '0x15290698ceD8B316933565F14318FC524f831a6b';

export interface AssetID {
	token: Address;
	tokenId: Uint256;
}

export enum AssetStatus {
	List,
	Selling,
}

export interface Asset {
	owner: Address;
	status: AssetStatus;
	category: number;
	flags: number;
	name: string;
	lastOrderId: Uint256;
	lastDealOrderId: Uint256;
}

export interface SellStore {
	token: Address;
	tokenId: Uint256;
	maxSellPrice: Uint256;
	minSellPrice: Uint256;
	lifespan: Uint256;
	expiry: Uint256;
	buyPrice: Uint256;
	bigBuyer: Address;
}

export interface SellOrder {
	token: Address;
	tokenId: Uint256;
	maxSellPrice: Uint256;
	minSellPrice: Uint256;
	lifespan: Uint256;
}

export default interface Exchange {
	ORDER_MAX_LIFESPAN(): Promise<Uint256>;
	ORDER_MIN_LIFESPAN(): Promise<Uint256>;
	feePlan(): Promise<Address>;
	lastOrderId(): Promise<Uint256>;
	ledger(): Promise<Address>;
	owner(): Promise<Address>;
	renounceOwnership(): TransactionPromise;
	sellingOrders(orderId: Uint256): Promise<SellStore>
	teamAddress(): Promise<Address>;
	transferOwnership(newOwner: Address): TransactionPromise;
	votePool(): Promise<Address>;
	initialize(name: Address, feePlan_: Address, ledger_: Address, votePool_: Address, team: Address): TransactionPromise;
	withdraw(asset: AssetID): TransactionPromise;
	sell(order: SellOrder): TransactionPromise;
	buy(orderId: Uint256): TransactionPromise;
	tryEndBid(orderId: Uint256): TransactionPromise;
	onERC721Received(_: Address, from: Address, tokenId: Uint256, data: Bytes): TransactionPromise;
	getSellOrder(orderId: Uint256): Promise<{status: number; lifespan: Uint256; minPrice: Uint256}>;
	assetOf(asset: AssetID): Promise<Asset>;
}