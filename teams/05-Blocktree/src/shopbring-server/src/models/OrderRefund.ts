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

export default class OrderRefund extends Model {
	id!: string // 退货订单ID
	userId!: string // 用户ID
	consumer!: string // 消费者账户地址
	shopping_agent!: string // 代购者账户地址
	o_id!: string // 支付订单ID
	return_amount!: string // 退款金额
	create_time!:number // 提交时间
	accept_time!:number // 接受时间
	shipping_time!:number // 发货时间
	end_time!:number // 完成时间
	logistics_company!:string // 物流公司
	shipping_num!:string // 发货运单号
	receiver!:string // 退单收货人
	receiver_phone!:string // 退单收货人电话
	shipping_address!:string // 退单收货地址
	note!:string // 备注
	total!:string // 商品法币合计
	return_type!: number // 0：退货退款，1：只退款
	return_reason!: string // 退款理由
	version!:string // 数据格式版本
	onchain_status!:string // 上链状态
	ext_order_hash!:string // 支付订单哈希
	ext_return_hash!:string // 退款订单哈希
	shipping_hash!:string // 运单哈希值
	block_index!:number // 区块高度索引
	ctime!:number
	utime!:number
	state!:number

	static get tableName (): string {
		return 'sbg_order_refund';
	}
}
