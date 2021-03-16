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

export default class GetOrderRefundRes {
	constructor () {
		this.order_id = '';
		this.consumer = '';
		this.shopping_agent = '';
		this.pay_order_id = '';
		this.return_amount = '';
		this.create_time = 0;
		this.accept_time = 0;
		this.shipping_time = 0;
		this.end_time = 0;
		this.logistics_company = '';
		this.shipping_num = '';
		this.receiver = '';
		this.receiver_phone = '';
		this.shipping_address = '';
		this.return_type = 0;
		this.return_reason = '';
		this.version = '';
		this.note = '';
		this.total = '';
		this.onchain_status = '';
		this.ext_order_hash = '';
		this.ext_return_hash = '';
		this.shipping_hash = '';
		this.commodities = [];
	}

	order_id: string; // 退单ID
	pay_order_id: string; // 原订单ID
	consumer: string;
	shopping_agent: string;
    return_amount: string; // 退款金额
	create_time: number;
	accept_time: number;
	shipping_time: number;
	end_time: number;
	logistics_company: string;
	shipping_num: string;
	receiver: string;
	receiver_phone: string;
	shipping_address: string;
	note: string; // 备注
	total: string;
	return_type: number;
	return_reason: string;
	version: string;
	onchain_status: string;
	ext_order_hash: string;
	ext_return_hash: string;
	shipping_hash: string;
	commodities: CommodityVo[]; // 商品对象列表
}
