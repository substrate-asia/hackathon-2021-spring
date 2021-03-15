/**
 * @copyright © 2020 Copyright hardchain
 * @date 2021-01-04
 */

import web3 from '../../src/web3';
import Happy from 'web3z/happy';

import * as Users from './Users';
import * as Logs from './Logs';
import * as LicenseTypes from './LicenseTypes';
import * as Organizations from './Organizations';

export default {
	get users() { return Happy.instance<Users.default>(Users, web3.queue) },
	get organizations() { return Happy.instance<Organizations.default>(Organizations, web3.queue) },
	get license_types() { return Happy.instance<LicenseTypes.default>(LicenseTypes, web3.queue) },
	get logs() { return Happy.instance<Logs.default>(Logs, web3.queue) },
}