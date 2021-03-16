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
export default class ApplyOrderRes {
	constructor (consumer: string, payment_amount: string, tip:string, currency: string, required_deposit: string, required_credit: string, version: string, ext_order_hash: string) {
		this.consumer = consumer;
		this.payment_amount = payment_amount;
		this.tip = tip;
		this.currency = currency;
		this.required_deposit = required_deposit;
		this.required_credit = required_credit;
		this.version = version;
		this.ext_order_hash = ext_order_hash;
	}

	consumer : string; // 消费者地址
    payment_amount : string; // 支付金额
	tip : string; // 小费
	currency :string; // 支付币种
	required_deposit : string; // 保证金要求
	required_credit : string; // 信用值要求
	version : string; // 交易单版本
	ext_order_hash : string; // 外部链下订单系统的订单哈希
}
