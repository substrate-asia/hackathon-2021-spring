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

export default class Commodity extends Model {
	id!: string // 商品ID
	skuid!: string // 商品编号
	o_id!: string // 订单ID
	name!: string // 商品名字
	url!: string // 商品链接
	img!: string // 商品图片
	options!:string // 附加选项,JSON数组字符串
	amount!:number // 数量
	price!:string // 法币单价
	total!:string // 法币小计
	note!:string // 备注
	ctime!:number
	utime!:number
	state!:number

	static get tableName (): string {
		return 'sbg_commodity';
	}
}

