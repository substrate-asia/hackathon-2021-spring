// Copyright 2019-2020 @paritytech/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 *
 */

export default function (address) {
	// const network = getNetwork();
	const ss58Format = 42;

	// if (!network || ss58Format === undefined) {
	// 	return null;
	// }

	try{
		return encodeAddress(address, ss58Format);
	} catch(e) {
		console.error('getEncodedAddress error', e);
		return null;
	}
}