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

import { BaseReq } from './baseReq';
import CommodityVo from './commodityVo';

export default class ApplyOrderReq extends BaseReq {
	constructor () {
		super();
		this.payment_amount = '';
		this.tip = '';
		this.currency = '';
		this.required_deposit = '';
		this.required_credit = '';
		this.note = '';
		this.platform_id = '';
		this.place_id = '';
		this.merchant = '';
		this.total = '';
		this.commodities = [];
	}

    payment_amount: string; // 支付金额
	tip: string; // 小费
	currency: string; // 支付币种
	required_deposit: string; // 保证金要求
	required_credit: string; // 信用值要求
	note: string; // 备注
	platform_id: string; // 平台ID
	place_id: string; // 收货地址ID
	merchant: string; // 商家账号
	total: string // 商品法币合计
	commodities: CommodityVo[]; // 商品对象列表
}
