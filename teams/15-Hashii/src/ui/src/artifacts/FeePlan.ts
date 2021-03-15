/**
 * @copyright © 2021 Copyright hardchain
 * @date 2021-01-05
 */

import {TransactionPromise} from 'web3z';
import {Address,Uint256, Uint16} from 'web3z/solidity_types';
import * as json from './FeePlan.json';

export const abi = json.abi;
export const contractName = json.contractName;
export const contractAddress = '0xC86078CA52C538E89b3Ab3b4439c01267AFF4e89';

export default interface FeePlan {
	owner(): Promise<Address>;
	initialize(admin: Address): TransactionPromise;
	renounceOwnership(): TransactionPromise;
	transferOwnership(): TransactionPromise;
	feeToTeam(): Promise<Uint16>;
	feeToTeamAtFirst(): Promise<Uint16>;
	feeToVoter(): Promise<Uint16>;
	feeToVoterAtFirst(): Promise<Uint16>;
	formula(value: Uint256, firstBid: boolean, votes: Uint256): Promise<{ toSeller: Uint256; toVoter: Uint256; toTeam: Uint256 }>;
}