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
import blake2b from '@anzerr/blake2b';
import { TypeRegistry } from '@polkadot/types/create';
import { Text } from '@polkadot/types/primitive';

const registry = new TypeRegistry();

export class Blake2Hash {
	constructor () {
		this.data = [];
	}

	data:number[]
	add (arr: string[]):Blake2Hash {
		arr.forEach(s => {
			const len = this.data.length;
			const u8a = new Text(registry, s).toU8a();
			for (let i = 0; i < u8a.length; i++) {
				this.data[i + len] = u8a[i];
			}
		});
		return this;
	}

	hash ():string {
		if (this.data.length === 0) {
			return '';
		}
		const context = blake2b.createHash({ digestLength: 32 });
		context.update(new Uint8Array(this.data));
		return '0x' + context.digest().toString('hex');
	}
}
