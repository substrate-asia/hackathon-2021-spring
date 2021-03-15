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

export default class ShippingOrderReq extends BaseReq {
	constructor () {
		super();
		this.order_type = 0;
		this.order_id = '';
		this.shipping_num = '';
	}

	order_type: number; // 订单类型 1.支付 2.退款
    order_id: string; // 订单ID
	shipping_num: string; // 快递运号
}
