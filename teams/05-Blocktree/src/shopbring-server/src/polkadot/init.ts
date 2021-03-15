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

import { ApiPromise, WsProvider } from '@polkadot/api';

import types from './types';

const provider = new WsProvider(process.env.POLKADOT_NETWORK || '');

export default class PolkadotWsApi {
	constructor () {
		this.init();
	}

	api:Promise<ApiPromise> | undefined;

	init (): void{
		ApiPromise.create({
			provider: provider,
			types: types
		}).then(api => {
			this.api = new Promise(resolve => { resolve(api); });
		}).catch(err => { console.log(err); });
	}
}