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

export default class Order extends Model {
	id!: string // 支付订单ID
	userId!: string // 用户ID
	consumer!: string // 消费者账户地址
	shopping_agent!: string // 代购者账户地址
	payment_amount!: string // 支付金额
	tip!: string // 小费
	currency!:string // 支付币种
	status!:string // 订单状态
	create_time!:number // 提交时间
	accept_time!:number // 接受时间
	shipping_time!:number // 发货时间
	end_time!:number // 完成时间
	required_deposit!:string // 保证金要求
	required_credit!: string // 信用值要求
	logistics_company!:string // 物流公司
	shipping_num!:string // 发货运单号
	receiver!:string // 收货人
	receiver_phone!:string // 收货人电话
	shipping_address!:string // 收货地址
	is_return!:number // 是否有申请退货
	platform_id!:string // 电商平台ID
	platform_name!:string // 电商平台名称
	platform_order_num!:string // 电商平台订单号
	merchant!:string // 商家账户
	note!:string // 备注
	fare!:string // 商品法币运费
	total!:string // 商品法币合计
	version!:string // 数据格式版本
	onchain_status!:string // 上链状态
	ext_order_hash!:string // 订单哈希值
	shipping_hash!:string // 运单哈希值
	block_index!:number // 区块高度索引
	ctime!:number
	utime!:number
	state!:number

	static get tableName (): string {
		return 'sbg_order';
	}
}
