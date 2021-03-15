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
import { Model } from 'objection';

import connection from './connection';

Model.knex(connection);

export default class ReturnOrder extends Model {
	id!: string // 退款订单ID
	o_id!: string // 支付订单ID
	return_amount!: string // 退货金额
	status!: string // 退货状态
	create_time!:number // 提交时间
	accept_time!:number // 接受时间
	shipping_time!:number // 发货时间
	end_time!:number // 完成时间
	logistics_company!:string // 物流公司
	shipping_num!:string // 发货运单号
	receiver!:string // 收货人
	receiver_phone!:string // 收货人电话
	shipping_address!:string // 收货地址
	note!:string // 备注
	return_type!:string // 类型：0：退货退款，1：只退款
	return_reason!:string // 退货原因
	version!:number // 数据格式版本
	onchain_status!:string // 上链状态
	ctime!:number
	utime!:number
	state!:number

	static get tableName (): string {
		return 'sbg_return_order';
	}
}

