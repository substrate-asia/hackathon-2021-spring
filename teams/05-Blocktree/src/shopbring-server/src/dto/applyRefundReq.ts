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

export default class ApplyRefundReq extends BaseReq {
	constructor () {
		super();
		this.o_id = '';
		this.return_amount = '';
		this.total = '';
		this.note = '';
		this.return_type = 0;
		this.return_reason = '';
		this.return_commodities = [];
	}

	o_id: string; // 支付订单ID
    return_amount: string; // 退款金额
	total: string; // 商品法币合计
	note: string; // 备注
	return_type: number; // 0：退货退款，1：只退款
	return_reason: string; // 退货理由
	return_commodities: CommodityVo[]; // 商品对象列表
}
