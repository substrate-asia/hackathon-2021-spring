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
export default class AcceptRefundRes {
	constructor (consumer: string, shopping_agent: string, return_amount:string, version: string, ext_order_hash: string, ext_return_hash: string) {
		this.consumer = consumer;
		this.shopping_agent = shopping_agent;
		this.return_amount = return_amount;
		this.version = version;
		this.ext_order_hash = ext_order_hash;
		this.ext_return_hash = ext_return_hash;
	}

	consumer : string; // 消费者地址
	shopping_agent: string; // 代购者地址
    return_amount : string; // 退款金额
	version : string; // 交易单版本
	ext_order_hash : string; // 外部链下订单系统的订单哈希
	ext_return_hash : string; // 退货订单哈希
}
