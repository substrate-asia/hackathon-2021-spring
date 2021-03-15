/**
 * @copyright © 2020 Copyright hardchain
 * @date 2021-01-04
 */

import web3 from '../web3';
import Happy from 'web3z/happy';

import * as Exchange from './Exchange';
import * as FeePlan from './FeePlan';
import * as Ledger from './Ledger';
import * as VotePool from './VotePool';

export default {
	get exchange() { return Happy.instance<Exchange.default>(Exchange, web3) },
	get fee_plan() { return Happy.instance<FeePlan.default>(FeePlan, web3) },
	get ledger() { return Happy.instance<Ledger.default>(Ledger, web3) },
	get vote_pool() { return Happy.instance<VotePool.default>(VotePool, web3) },
}