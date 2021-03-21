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
import { decodeAddress } from '@polkadot/util-crypto';

import ConfirmMailReq from '../dto/confirmMailReq';
import ConfirmMailRes from '../dto/confirmMailRes';
import GetUserReq from '../dto/getUserReq';
import GetUserRes from '../dto/getUserRes';
import LoginReq from '../dto/loginReq';
import LoginRes from '../dto/loginRes';
import NonceReq from '../dto/nonceReq';
import NonceRes from '../dto/nonceRes';
import RegisterReq from '../dto/registerReq';
import RegisterRes from '../dto/registerRes';
import BizException from '../exceptions/BizException';
import User from '../models/User';
import { nextId } from '../snowflake';
import JWT from '../token/jwt';
import { confirmMail, sendMail } from '../utils/mail';
import msg from '../utils/messages';
import { valid_email } from '../utils/regular';
import { bounds_time, dberr, getUserBySub, valid_pubkey } from '../utils/webx';

const MAIL_MODE = (process.env.MAIL_MODE || '') === 'test' ? 1 : 0;

export default class UserService {
	public async Login (req: LoginReq): Promise<LoginRes> {
		let pubkey = '';
		try {
			pubkey = u8aToHex(decodeAddress(req.address));
		} catch (err) {
			throw new BizException(msg.CRYPTO_ERR, err);
		}
		// 校验nonce,pubkey
		valid_pubkey(pubkey, req.nonce, req.message, req.signature, req.time);

		const user = await User.query().where('pubkey', pubkey).first().catch(dberr);
		if (!user || user.id === '') {
			throw new BizException(msg.BIZ_ERR, 'user not exist');
		}
		if (user.validEmail === 0) {
			throw new BizException(msg.BIZ_ERR, 'Email not verified. Please check your email.');
		}
		const jwt = new JWT();
		const token = jwt.create(user.id);
		const secret = jwt.secret(token);
		return new Promise(resolve => {
			resolve(new LoginRes(token, secret));
		});
	}

	public async GetUser (req: GetUserReq): Promise<GetUserRes> {
		const user = await getUserBySub(req.ctxUserId);
		return new Promise(resolve => {
			resolve(new GetUserRes(user.nickname, user.email, user.address));
		});
	}

	public async Nonce (req: NonceReq): Promise<NonceRes> {
		if (!req) {
			throw new BizException(msg.BIZ_ERR, 'nonce request undefined');
		}
		const zero_time = new Date(new Date().toLocaleDateString()).getTime();
		const curr_time = new Date().getTime();
		// 为了校验安全和有效性每天0点前60秒内禁止获取nonce
		if (curr_time >= zero_time + bounds_time) {
			throw new BizException(msg.BIZ_ERR, 'busy business, please try again in 60 seconds');
		}
		// 实现nonce密钥部分每天动态值变更,防止旧nonce被暴力撞库
		const nonce = nextId();
		const nckey = process.env.NONCE_KEY || '';
		const message = new JWT().signature(nckey + zero_time.toString() + nonce + curr_time.toString());
		return new Promise(resolve => {
			resolve(new NonceRes(message, nonce, curr_time));
		});
	}

	public async Register (req: RegisterReq): Promise<RegisterRes> {
		let pubkey = '';
		try {
			pubkey = u8aToHex(decodeAddress(req.address));
		} catch (err) {
			throw new BizException(msg.CRYPTO_ERR, err);
		}
		valid_email(req.email);
		// 校验nonce,pubkey
		valid_pubkey(pubkey, req.nonce, req.message, req.signature, req.time);

		const exist = await User.query().where('email', req.email).resultSize();
		if (exist > 0) {
			throw new BizException(msg.BIZ_ERR, 'email exists');
		}
		let user = await User.query().where('pubkey', pubkey).first().catch(dberr);
		if (!user) {
			user = await User.query()
				.insert({
					address: req.address,
					ctime: new Date().getTime(),
					email: req.email,
					id: nextId(),
					mobile: req.mobile,
					nickname: req.nickname,
					pubkey: pubkey,
					state: 1,
					username: '',
					utime: new Date().getTime(),
					validEmail: MAIL_MODE,
					validMobile: 0
				}).catch(dberr);
			if (!user) {
				throw new BizException(msg.BIZ_ERR, 'user save failed');
			}
		} else {
			throw new BizException(msg.BIZ_ERR, 'Your key already registered.');
		}
		if (user.validEmail === 0) {
			sendMail(req.email, user.id);
		}
		return new Promise(resolve => {
			resolve(new RegisterRes());
		});
	}

	public async ConfirmEmail (req: ConfirmMailReq): Promise<ConfirmMailRes> {
		const valid = confirmMail(req.nonce, req.time, req.message);
		if (!valid) {
			throw new BizException(msg.BIZ_ERR, 'invalid or timed out');
		}
		const user = await User.query().where('id', req.nonce).first().catch(dberr);
		if (!user) {
			throw new BizException(msg.BIZ_ERR, 'get user failed');
		}
		if (user.validEmail === 1) {
			throw new BizException(msg.BIZ_ERR, 'email authenticated');
		}
		const numUpdated = await User.query().findById(req.nonce).patch({
			utime: new Date().getTime(),
			validEmail: 1
		}).catch(dberr);
		if (numUpdated <= 0) {
			throw new BizException(msg.BIZ_ERR, 'email verify failed');
		}
		return new Promise(resolve => {
			resolve(new ConfirmMailRes());
		});
	}
}
