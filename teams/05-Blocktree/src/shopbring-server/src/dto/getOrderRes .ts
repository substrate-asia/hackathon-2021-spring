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

import CommodityVo from './commodityVo';

export default class GetOrderRes {
	constructor () {
		this.order_id = '';
		this.consumer = '';
		this.shopping_agent = '';
		this.payment_amount = '';
		this.tip = '';
		this.currency = '';
		this.create_time = 0;
		this.accept_time = 0;
		this.shipping_time = 0;
		this.end_time = 0;
		this.required_deposit = '';
		this.required_credit = '';
		this.logistics_company = '';
		this.shipping_num = '';
		this.receiver = '';
		this.receiver_phone = '';
		this.shipping_address = '';
		this.is_return = 0;
		this.platform_name = '';
		this.platform_order_num = '';
		this.merchant = '';
		this.note = '';
		this.fare = '';
		this.total = '';
		this.onchain_status = '';
		this.ext_order_hash = '';
		this.shipping_hash = '';
		this.version = '';
		this.commodities = [];
	}

	order_id: string;
	consumer: string;
	shopping_agent: string;
    payment_amount: string; // 支付金额
	tip: string; // 小费
	currency: string; // 支付币种
	create_time: number;
	accept_time: number;
	shipping_time: number;
	end_time: number;
	required_deposit: string; // 保证金要求
	required_credit: string; // 信用值要求
	logistics_company: string;
	shipping_num: string;
	receiver: string;
	receiver_phone: string;
	shipping_address: string;
	is_return:number;
	platform_name:string;
	platform_order_num: string;
	merchant: string;
	note: string; // 备注
	fare: string;
	total: string;
	onchain_status: string;
	ext_order_hash: string;
	shipping_hash: string;
	version: string;
	commodities: CommodityVo[]; // 商品对象列表
}
