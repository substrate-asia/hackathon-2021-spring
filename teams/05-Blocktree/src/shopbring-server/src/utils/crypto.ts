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
import { u8aToHex } from '@polkadot/util';
import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';

import BizException from '../exceptions/BizException';
import msg from '../utils/messages';

export default class Crypto {
	public static VerifySignature (message: Uint8Array | string, signature: Uint8Array | string, addressOrPublicKey: Uint8Array | string): boolean {
		try {
			return signatureVerify(message, signature, addressOrPublicKey).isValid;
		} catch (err) {
			throw new BizException(msg.CRYPTO_ERR, err);
		}
	}

	public static GetPublicKey (address: string | Uint8Array): string {
		try {
			const publicKey = decodeAddress(address);
			return u8aToHex(publicKey);
		} catch (err) {
			throw new BizException(msg.CRYPTO_ERR, err);
		}
	}
}
