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
import nodemailer from 'nodemailer';

import BizException from '../exceptions/BizException';
import Mail from '../models/Mail';
import { nextId } from '../snowflake';
import msg from './messages';

const pass = process.env.MAIL_PASS || '';
const secret = process.env.MAIL_SECRET || '';
const sender = process.env.MAIL_SENDER || '';
const callurl = process.env.MAIL_CALLURL || '';

const transporter = nodemailer.createTransport({
	// node_modules/nodemailer/lib/well-known/services.json  查看相关的配置，如果使用qq邮箱，就查看qq邮箱的相关配置
	auth: {
		pass: pass, // smtp 的授权码
		user: sender // 发送方的邮箱
	},
	secure: true, // true for 465, false for other ports
	service: 'qq' // 类型qq邮箱
});
// pass 不是邮箱账户的密码而是stmp的授权码（必须是相应邮箱的stmp授权码）
// 邮箱---设置--账户--POP3/SMTP服务---开启---获取stmp授权码

export const sendMail = function (receiver:string, openid: string): void {
	const time = new Date().getTime();
	const message = sign_param(openid + time.toString());
	const linkpath = callurl + '?nonce=' + openid + '&time=' + time.toString() + '&message=' + message;

	// 发送的配置项
	const mailOptions = {
		from: '"ShopBring Team" <' + sender + '>', // 发送方
		html: '<p>You’re just one click away from getting started with ShopBring. </p><p>All you need to do is verify your email address to activate your ShopBring account.</p><p><a href="' + linkpath + '">Confirm My Email</a></p>',
		port: 465,
		subject: 'Activate Your ShopBring Account Now', // 标题
		text: '', // 文本内容
		to: receiver // 接收者邮箱，多个邮箱用逗号间隔
	};

	// 发送函数
	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			throw new BizException(msg.BIZ_ERR, 'send email failed');
		} else {
			Mail.query()
				.insert({
					ctime: new Date().getTime(),
					id: nextId(),
					link: linkpath,
					receiver: receiver,
					result: JSON.stringify(info),
					sender: sender,
					state: 1,
					userId: openid,
					utime: new Date().getTime()
				}).catch(function (err: Error) {
					throw new BizException(msg.DB_ERR, err.message);
				});
		}
	});
};

export const confirmMail = function (nonce: string, time: number, message: string): boolean {
	if (time <= 0) {
		return false;
	}
	if (!nonce || nonce.length !== 19) {
		return false;
	}
	if (!message || message.length !== 64) {
		return false;
	}
	if (Math.abs(new Date().getTime() - time) > 2592000000) {
		return false;
	}
	return sign_param(nonce + time.toString()) === message;
};

const sign_param = function (text: string): string {
	const hmac = crypto.createHmac('sha256', secret);
	const content = hmac.update(text);
	return content.digest('hex');
};
