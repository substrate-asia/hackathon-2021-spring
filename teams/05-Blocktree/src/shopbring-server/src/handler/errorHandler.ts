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

import ResDto from '../dto/unifyRes';
import BizException from '../exceptions/BizException';
import msg from '../utils/messages';

function errorHandler (err: Error, req: Request, res: Response, next: NextFunction): void {
	if (err === undefined || err === null) {
		next();
	} else {
		console.log(err);
		const time = new Date().getTime();
		if (err instanceof BizException) {
			if (err.code === msg.JSON_ERR) {
				res.json(new ResDto<string>(err.code, msg.JSON_ERR_MSG, '', time, ''));
			} else if (err.code === msg.CRYPTO_ERR) {
				res.json(new ResDto<string>(err.code, msg.CRYPTO_ERR_MSG, '', time, ''));
			} else if (err.code === msg.DB_ERR) {
				res.json(new ResDto<string>(err.code, msg.DB_ERR_MSG, '', time, ''));
			} else {
				res.json(new ResDto<string>(err.code, err.message, '', time, ''));
			}
		} else {
			res.json(new ResDto<string>(msg.UNKNOW_ERR, msg.UNKNOW_ERR_MSG, '', time, ''));
		}
	}
}
export default errorHandler;
