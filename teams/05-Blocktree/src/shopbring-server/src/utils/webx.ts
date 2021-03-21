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
import { NextFunction, Request, Response } from 'express';

import { BaseReq } from '../dto/baseReq';
import ReqDto from '../dto/unifyReq';
import ResDto from '../dto/unifyRes';
import BizException from '../exceptions/BizException';
import User from '../models/User';
import JWT from '../token/jwt';
import Crypto from '../utils/crypto';
import JSONObject from '../utils/json';
import msg from './messages';

const skipLoginUrl = ['/user/login', '/user/register', '/user/nonce', '/user/confirmMail', '/product/scratch', '/order/index'];

const expire_time = 60000;

const igrxAuth = false;

export const bounds_time = 86400000 - expire_time;

export const reqx = function <T extends BaseReq> (req: Request, next: NextFunction): T | undefined {
	try {
		const url = req.path;
		if (req.method.toLowerCase() !== 'post') {
			throw new BizException(msg.AUTH_INVALID, 'only post requests are supported');
		}
		const token = (req.headers.authorization || '').replace('Bearer ', '');
		const jwt = authx(url, token);
		const reqd = <ReqDto>req.body;
		if (!reqd.d) {
			throw new BizException(msg.AUTH_INVALID, 'request data empty');
		}
		if (!igrxAuth && jwt.sub !== '') {
			// 校验参数签名
			const param = reqd.d + reqd.n + reqd.t.toString();
			const secret = jwt.secret(token);
			if (!jwt.valid_param(param, secret, reqd.s)) {
				throw new BizException(msg.AUTH_INVALID, 'request sign invalid');
			}
			if (reqd.t <= 0) {
				throw new BizException(msg.AUTH_INVALID, 'request time invalid');
			}
			// 校验参数期限
			if (Math.abs(new Date().getTime() - reqd.t) > 600000) {
				throw new BizException(msg.AUTH_INVALID, 'request time expired');
			}
		}
		try {
			const data = Buffer.from(reqd.d, 'base64').toString();
			// const ret = <T>JSONBig.parse(data);
			const ret = new JSONObject<T>().parse(data);
			if (!ret.offset || ret.offset < 0) {
				ret.offset = 0;
			}
			if (!ret.limit || ret.limit < 0 || ret.limit > 100) {
				ret.limit = 20;
			}
			ret.ctxUserId = jwt.sub;
			return ret;
		} catch (err) {
			throw new BizException(msg.JSON_ERR, err);
		}
	} catch (err) {
		errx(next, err);
		return undefined;
	}
};

export const resx = function <T> (req:Request, res: Response, t: T): void {
	let isigr = false;
	const url = req.path;
	for (let i = 0; i < skipLoginUrl.length; i++) {
		if (url === skipLoginUrl[i]) {
			isigr = true;
			break;
		}
	}
	const jwt = new JWT();
	const data = Buffer.from(new JSONObject<T>().stringify(t)).toString('base64');
	const time = new Date().getTime();
	if (!isigr) {
		const token = (req.headers.authorization || '').replace('Bearer ', '');
		const secret = jwt.secret(token);
		const sign = jwt.sign_param(data + time.toString(), secret);
		res.json(new ResDto<string>(msg.OK, msg.OK_MSG, data, time, sign));
	} else {
		res.json(new ResDto<string>(msg.OK, msg.OK_MSG, data, time, ''));
	}
};

export const errx = function (next: NextFunction, err: Error): void {
	if (err instanceof BizException) {
		next(err);
	} else {
		console.log('unknow: ', err.message);
		next(new BizException(msg.UNKNOW_ERR, msg.UNKNOW_ERR_MSG));
	}
};

export const authx = function (url: string, token: string): JWT {
	const jwt = new JWT();
	for (let i = 0; i < skipLoginUrl.length; i++) {
		if (url === skipLoginUrl[i]) {
			return jwt;
		}
	}
	if (!token) {
		throw new BizException(msg.AUTH_INVALID, 'token missing');
	}
	const part = token.split('.');
	if (part.length !== 2) {
		throw new BizException(msg.AUTH_INVALID, 'token error');
	}
	// token验签
	if (!igrxAuth && !jwt.verify(part[0], part[1])) {
		throw new BizException(msg.AUTH_INVALID, 'token invalid');
	}
	// token有效校验
	try {
		jwt.restore(part[0]);
	} catch (err) {
		throw new BizException(msg.JSON_ERR, err);
	}
	if (jwt.exp < new Date().getTime()) {
		throw new BizException(msg.AUTH_EXPIRED, 'token expired');
	}
	return jwt;
};

export const valid_pubkey = function (pubkey: string, nonce: string, message: string, signature:string, time: number): void {
	if (!pubkey) {
		throw new BizException(msg.BIZ_ERR, 'pubkey empty');
	}
	if (!nonce) {
		throw new BizException(msg.BIZ_ERR, 'nonce empty');
	}
	if (!message) {
		throw new BizException(msg.BIZ_ERR, 'message empty');
	}
	if (!signature) {
		throw new BizException(msg.BIZ_ERR, 'signature empty');
	}
	if (time <= 0) {
		throw new BizException(msg.BIZ_ERR, 'request time invalid');
	}
	if (Math.abs(new Date().getTime() - time) > expire_time) {
		throw new BizException(msg.BIZ_ERR, 'request expired more than 60 seconds, please refresh page.');
	}
	// 校验Nonce签名
	const nckey = process.env.NONCE_KEY || '';
	const zero_time = new Date(new Date().toLocaleDateString()).getTime();
	const check_msg = new JWT().signature(nckey + zero_time.toString() + nonce + time.toString());
	if (check_msg !== message) {
		throw new BizException(msg.BIZ_ERR, 'request nonce invalid');
	}
	// 公钥校验签名
	if (!Crypto.VerifySignature(message, signature, pubkey)) {
		throw new BizException(msg.BIZ_ERR, 'pubkey invalid signature');
	}
};

export async function getUserBySub (sub: string): Promise<User> {
	const user = await User.query().where('id', sub).first().catch(dberr);
	if (!user) {
		throw new BizException(msg.BIZ_ERR, 'get user failed');
	}
	return new Promise(resolve => {
		resolve(user);
	});
}

export async function getUserByAddress (address: string): Promise<User> {
	const user = await User.query().where('address', address).first().catch(dberr);
	if (!user) {
		throw new BizException(msg.BIZ_ERR, 'get user failed');
	}
	return new Promise(resolve => {
		resolve(user);
	});
}

export function hasInt (a: number, b:number[]):boolean {
	if (b && b.length > 0) {
		for (let i = 0; i < b.length; i++) {
			if (a === b[i]) {
				return true;
			}
		}
	}
	throw new BizException(msg.BIZ_ERR, 'invalid param value');
}

export const dberr = function (err: string): void {
	throw new BizException(msg.DB_ERR, err);
};

