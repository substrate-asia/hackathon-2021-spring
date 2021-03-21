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

import crypto from 'crypto';

import { nextId } from '../snowflake';

const default_jwt_key = '*h%CR#ZWe3J9jQSUykX5B3!c@8CKeLf2y';

export default class JWT {
	constructor () {
		this.sub = '';
		this.aud = '';
		this.iss = '';
		this.jti = '';
		this.inf = '';
		this.dev = '';
		this.iat = new Date().getTime();
		this.exp = this.iat + 1296000000;
	}

	sub: string; // 用户主体
	aud: string; // 接收主体
	iss: string; // 签发主体
	iat: number; // 授权时间
	exp: number; // 过期时间
	jti: string; // 唯一编号
	dev: string; // 设备类型,web/app
	inf: string; // 扩展信息

	create (sub: string): string {
		this.jti = nextId();
		this.sub = sub;
		this.aud = 'SHOPBRING';
		this.iss = this.aud;
		const text = Buffer.from(JSON.stringify(this)).toString('base64');
		return text + '.' + this.signature(text);
	}

	verify (text: string, sign: string): boolean {
		if (!text || !sign) {
			return false;
		}
		return this.signature(text) === sign;
	}

	signature (text: string): string {
		return this.sign_param(text, process.env.JWT_KEY || default_jwt_key);
	}

	secret (text: string): string {
		const result = this.signature(text);
		const result_ = result.substring(15, 29) + result.substring(12, 19) + result.substring(15, 27);
		const result_arr = result_.split('').reverse();
		let result_sig = '';
		for (let i = 0; i < result_arr.length; i++) {
			result_sig = result_sig + result_arr[i];
		}
		return result_sig;
	}

	valid_param (text: string, secret: string, sign: string): boolean {
		return this.sign_param(text, secret) === sign;
	}

	sign_param (text: string, secret: string): string {
		const hmac = crypto.createHmac('sha256', secret);
		const content = hmac.update(text);
		return content.digest('hex');
	}

	restore (text: string): void {
		const jsonstr = Buffer.from(text, 'base64').toString();
		const data = <JWT>JSON.parse(jsonstr);
		this.aud = data.aud;
		this.iss = data.iss;
		this.jti = data.jti;
		this.inf = data.inf;
		this.dev = data.dev;
		this.iat = data.iat;
		this.exp = data.exp;
		this.sub = data.sub;
	}
}
