/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2019, hardchain
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of hardchain nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL hardchain BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * ***** END LICENSE BLOCK ***** */

import buffer from 'somes/buffer';
import somes from 'somes';
import web3 from '../src/web3';
import ccl from './ccl';

const crypto_tx = require('crypto-tx');

export default async function() {
	console.log('currentProvider', web3.currentProvider);
	console.log('web3.getBlockNumber', await web3.eth.getBlockNumber());

	var license_types = ccl.license_types.happy();
	var logs = ccl.logs.happy();

	console.log('license_types', await license_types.get('11100000000019713D057'));

	var data = `{"test":"test${somes.random()}"}`;
	var hash = crypto_tx.keccak(data).hex;
	var sign = await web3.eth.sign(hash, await web3.getDefaultAccount());
	var sign_b = buffer.from(sign.slice(2), 'hex');
	var r = '0x' + sign_b.slice(0, 32).toString('hex');
	var s = '0x' + sign_b.slice(32, 64).toString('hex');
	var v = sign_b[64];

	console.log('logs set', await logs.setHash(hash, r, s, v));
}
