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

import ConfirmMailReq from '../dto/confirmMailReq';
import GetUserReq from '../dto/getUserReq';
import LoginReq from '../dto/loginReq';
import NonceReq from '../dto/nonceReq';
import RegisterReq from '../dto/registerReq';
import UserService from '../services/user';
import { errx, reqx, resx } from '../utils/webx';

const userService = new UserService();

export function GetUser (req: Request, res: Response, next: NextFunction):void {
	// const tag = new GetUserReq();
	// const data = Buffer.from(JSON.stringify(tag)).toString('base64');
	// const nonce = '123456';
	// const time = new Date().getTime();
	// const token = (req.headers.authorization || '').replace('Bearer ', '');
	// const jwt = new JWT();
	// const sign = jwt.sign_param(data + nonce + time.toString(), jwt.secret(token));
	// const r = new ReqDto();
	// r.d = data;
	// r.n = nonce;
	// r.t = time;
	// r.s = sign;
	// console.log(JSON.stringify(r));
	const req_ = reqx<GetUserReq>(req, next);
	if (!req_) {
		return;
	}
	userService.GetUser(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function login (req: Request, res: Response, next: NextFunction): void {
	const req_ = reqx<LoginReq>(req, next);
	if (!req_) {
		return;
	}
	userService.Login(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function Register (req: Request, res: Response, next: NextFunction): void {
	const req_ = reqx<RegisterReq>(req, next);
	if (!req_) {
		return;
	}
	userService.Register(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function Nonce (req: Request, res: Response, next: NextFunction): void {
	const req_ = reqx<NonceReq>(req, next);
	if (!req_) {
		return;
	}
	userService.Nonce(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function ConfirmMail (req: Request, res: Response, next: NextFunction): void {
	const nonce = req.param('nonce');
	const time = req.param('time');
	const message = req.param('message');
	const req_ = new ConfirmMailReq(nonce, Number(time), message);
	userService.ConfirmEmail(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

