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

import BizException from '../exceptions/BizException';
import msg from './messages';

// 校验邮箱格式
const regular_email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// 校验金钱格式
const regular_money = /(^[1-9]([0-9]{0,12})?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
// 校验大整数格式
const regular_number = /(^[1-9]([0-9]{0,29})$)|(^(0){1}$)/;

export const valid_email = function (s: string):boolean {
	if (s && regular_email.test(s)) {
		return true;
	}
	throw new BizException(msg.BIZ_ERR, 'email invalid');
};

export const valid_money = function (s: string):boolean {
	if (s && regular_money.test(s)) {
		return true;
	}
	throw new BizException(msg.BIZ_ERR, 'money invalid');
};

export const valid_number = function (s: string):boolean {
	if (s && regular_number.test(s)) {
		return true;
	}
	throw new BizException(msg.BIZ_ERR, 'number invalid');
};

