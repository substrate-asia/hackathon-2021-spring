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

import BizException from '../exceptions/BizException';
import Order from '../models/Order';
import OrderRefund from '../models/OrderRefund';
import JSONObject from '../utils/json';
import msg from '../utils/messages';
import { dberr } from '../utils/webx';

const commissionedSection = 'commissionedShopping';

const ShoppingOrderUpdated_ = 'ShoppingOrderUpdated';
const ReturnOrderUpdated_ = 'ReturnOrderUpdated';
const ClearShoppingOrder_ = 'ClearShoppingOrder';
const ClearCommodityReturn_ = 'ClearCommodityReturn';

const commissionedMethod = [
	ShoppingOrderUpdated_,
	ReturnOrderUpdated_,
	ClearShoppingOrder_,
	ClearCommodityReturn_
];

export enum OrderStatus {
	Applied = 'Applied', // 订单初始化
    Pending = 'Pending', // 消费发布代购订单，订单委托中，等待代购者接单
    Accepted = 'Accepted', // 代购者已接受代购订单
    Shipping = 'Shipping', // 代购者已购买商品并发货中
    Received = 'Received', // 消费者已确认收货
	Returning = 'Returning', // 消费者申请退货
	Closed = 'Closed', // 消费者手动关闭订单
	Failed = 'Failed', // 代购者购物失败
	Archived = 'Archived', // 订单已归档，链上纪录已删除
}

export enum ReturnStatus {
    Applied = 'Applied', // 消费者申请退货
    Accepted = 'Accepted', // 代购者接受商品退货
    Refused = 'Refused', // 代购者不接受商品退货
    Shipping = 'Shipping', // 消费者发出要退货的商品
	Returned = 'Returned', // 代购者确认退货成功
	NoResponse = 'NoResponse', // 代购者没有回应退货而导致交易失败
	Closed = 'Closed', // 消费者手动关闭订单
	Archived = 'Archived', // 订单已归档，链上纪录已删除
}

/* eslint-disable sort-keys */
export default {
	Address: 'AccountId',
	LookupSource: 'AccountId',
	AssetId: 'u32',
	BlockNumber: 'u32',
	BalanceOf: 'u128',
	Byte4: '[u8; 4]',
	Byte8: '[u8; 8]',
	Byte16: '[u8; 16]',
	Byte32: '[u8; 32]',
	Byte64: '[u8; 64]',
	Byte128: '[u8; 128]',
	OrderStatus: {
		_enum: [
			'Pending',
			'Accepted',
			'Shipping',
			'Received',
			'Returning',
			'Closed',
			'Failed',
			'Archived'
		]
	},
	ReturnStatus: {
		_enum: [
			'Applied',
			'Accepted',
			'Refused',
			'Shipping',
			'Returned',
			'NoResponse',
			'Closed',
			'Archived'
		]
	},
	OrderInfo: {
		consumer: 'AccountId',
		shopping_agent: 'Option<AccountId>',
		payment_amount: 'BalanceOf',
		tip: 'BalanceOf',
		return_amount: 'BalanceOf',
		currency: 'AssetId',
		status: 'OrderStatus',
		create_time: 'BlockNumber',
		accept_time: 'BlockNumber',
		shipping_time: 'BlockNumber',
		end_time: 'BlockNumber',
		required_deposit: 'BalanceOf',
		required_credit: 'u64',
		shipping_hash: 'Option<Hash>',
		is_return: 'bool',
		version: 'u32'
	},
	ReturnInfo: {
		consumer: 'AccountId',
		shopping_agent: 'AccountId',
		return_amount: 'BalanceOf',
		status: 'ReturnStatus',
		create_time: 'BlockNumber',
		accept_time: 'BlockNumber',
		shipping_time: 'BlockNumber',
		end_time: 'BlockNumber',
		shipping_hash: 'Option<Hash>',
		version: 'u32'
	},
	AssetInfo: {
		symbol: 'Vec<u8>',
		decimal_places: 'u8'
	},
	InvitationInfo: {
		invitation_pk: 'Byte32',
		unit_bonus: 'BalanceOf',
		max_invitees: 'u32',
		frozen_amount: 'Balance',
		num_of_invited: 'u32',
		invitation_index: 'u32'
	},
	InvitationIndex: 'u64',
	OrderInfoOf: 'OrderInfo',
	ReturnInfoOf: 'ReturnInfo'
};

export class TaskResult {
	constructor (
		public blockIndex: number,
		public blockHash: string,
		public prevHash: string,
		public bestFinalizedIndex:number,
		public orderEvents: OrderEvent[]
	) {
		this.blockIndex = blockIndex;
		this.blockHash = blockHash;
		this.prevHash = prevHash;
		this.bestFinalizedIndex = bestFinalizedIndex;
		this.orderEvents = orderEvents;
	}
}

export class OrderEvent {
	constructor (
		public index: number, // 事件高度
		public section: string, // 事件模块
		public method : string // 事件方法
	) {
		this.index = index;
		this.section = section;
		this.method = method;
	}
}

/// ShoppingOrderUpdated 代购订单更新
/// - ext_order_hash Hash 外部链下订单系统的订单哈希
/// - order OrderInfo 订单信息
export class ShoppingOrderUpdated extends OrderEvent {
	constructor
	(
		public consumer: string, // 消费者地址
		public shopping_agent: string, // 代购者地址
		public payment_amount : bigint, // 支付金额
		public tip : bigint, // 小费
		public return_amount: bigint,
		public create_time: bigint,
		public accept_time: bigint,
		public shipping_time: bigint,
		public end_time: bigint,
		public is_return: boolean,
		public currency :bigint, // 支付币种
		public required_deposit : bigint, // 保证金要求
		public required_credit : bigint, // 信用值要求
		public version : bigint, // 交易单版本
		public ext_order_hash : string, // 外部链下订单系统的订单哈希
		public shipping_hash: string, // 运单哈希
		public status : string // 订单状态
	) {
		super(0, '', '');
		this.consumer = consumer;
		this.shopping_agent = shopping_agent;
		this.payment_amount = payment_amount;
		this.tip = tip;
		this.return_amount = return_amount;
		this.create_time = create_time;
		this.accept_time = accept_time;
		this.shipping_time = shipping_time;
		this.end_time = end_time;
		this.is_return = is_return;
		this.currency = currency;
		this.required_deposit = required_deposit;
		this.required_credit = required_credit;
		this.version = version;
		this.ext_order_hash = ext_order_hash;
		this.shipping_hash = shipping_hash;
		this.status = status;
	}
}

/// ReturnOrderUpdated 退货订单更新
/// - ext_order_hash Hash 外部链下订单系统的订单哈希
/// - ext_return_hash Hash 外部链下订单系统的退货单哈希
/// - return_order ReturnInfo 订单信息
export class ReturnOrderUpdated extends OrderEvent {
	constructor
	(
		public consumer: string, // 消费者地址
		public shopping_agent: string, // 代购者地址
		public return_amount : bigint, // 退货金额
		public create_time : bigint,
		public accept_time :bigint,
		public end_time : bigint,
		public shipping_time : bigint,
		public shipping_hash : string, // 退货运单证明
		public ext_order_hash : string, // 外部链下订单系统的订单哈希
		public ext_return_hash : string, // 退货订单哈希
		public status : string // 退货状态
	) {
		super(0, '', '');
		this.consumer = consumer;
		this.shopping_agent = shopping_agent;
		this.return_amount = return_amount;
		this.create_time = create_time;
		this.accept_time = accept_time;
		this.end_time = end_time;
		this.shipping_time = shipping_time;
		this.ext_order_hash = ext_order_hash;
		this.ext_order_hash = ext_order_hash;
		this.shipping_hash = shipping_hash;
		this.ext_return_hash = ext_return_hash;
		this.status = status;
	}
}

/// ClearShoppingOrder 清除已完成的代购订单
/// 1. 消费者`close_shopping_order`方法将触发该事件，OrderStatus = Closed。
/// 2. 外部调用`clear_shopping_order`，若系统检查订单已超过清理时限将触发事件，OrderStatus = Archived。
/// - ext_order_hash Hash 外部链下订单系统的订单哈希
// - status OrderStatus 订单状态
export class ClearShoppingOrder extends OrderEvent {
	constructor
	(
		public ext_order_hash: string, // 订单哈希
		public status: string // 订单状态
	) {
		super(0, '', '');
		this.ext_order_hash = ext_order_hash;
		this.status = status;
	}
}

/// ClearCommodityReturn 清理已完成的退货单
/// 1. 消费者`cancel_commodity_return`方法将触发该事件，ReturnStatus = Closed。
/// 2. 外部调用`clear_shopping_order`，若系统检查退货单已超过清理时限将触发事件，ReturnStatus = Archived。
/// - ext_order_hash Hash 外部链下订单系统的订单哈希
/// - ext_return_hash Hash 外部链下订单系统的退货单哈希
/// - status ReturnStatus 退货单状态
export class ClearCommodityReturn extends OrderEvent {
	constructor
	(
		public ext_order_hash: string, // 订单哈希
		public ext_return_hash: string, // 退单哈希
		public status: string // 订单状态
	) {
		super(0, '', '');
		this.ext_order_hash = ext_order_hash;
		this.ext_return_hash = ext_return_hash;
		this.status = status;
	}
}

export const conditionAccept = function (index:number, section: string, method: string, data: string[]): OrderEvent|undefined {
	if (!section || !method || !data) {
		return undefined;
	}
	if (section !== commissionedSection) {
		return undefined;
	}
	for (let i = 0; i < commissionedMethod.length; i++) {
		if (commissionedMethod[i] === method) { // 符合event方法
			return resolveEvent(index, section, method, data);
		}
	}
	return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const resolveEvent = function (index:number, section: string, method: string, data: string[]): OrderEvent {
	switch (method) {
	case ShoppingOrderUpdated_: {
		checkParam(ShoppingOrderUpdated_, data, 2);
		const hash = data[0];
		const info = new JSONObject<ShoppingOrderUpdated>().parse(data[1]);
		info.ext_order_hash = hash;
		info.section = section;
		info.method = method;
		info.index = index;
		return info;
	}
	case ReturnOrderUpdated_: {
		checkParam(ReturnOrderUpdated_, data, 3);
		const info = new JSONObject<ReturnOrderUpdated>().parse(data[2]);
		info.ext_order_hash = data[0];
		info.ext_return_hash = data[1];
		info.section = section;
		info.method = method;
		info.index = index;
		return info;
	}
	case ClearShoppingOrder_: {
		checkParam(ClearShoppingOrder_, data, 2);
		const info = new ClearShoppingOrder(data[0], data[1]);
		info.section = section;
		info.method = method;
		info.index = index;
		return info;
	}
	case ClearCommodityReturn_: {
		checkParam(ClearCommodityReturn_, data, 3);
		const info = new ClearCommodityReturn(data[0], data[1], data[2]);
		info.section = section;
		info.method = method;
		info.index = index;
		return info;
	}
	default: {
		throw new BizException(msg.EVENT_ERR, 'not found method name: ' + method);
	}
	}
};

async function getOrderByOrderHash (hash: string): Promise<Order> {
	const order = await Order.query().where('ext_order_hash', hash).first().catch(dberr);
	if (!order) {
		throw new BizException(msg.BIZ_ERR, 'get order by hash failed: ' + hash);
	}
	return new Promise(resolve => {
		resolve(order);
	});
}

async function getOrderByReturnHash (hash: string): Promise<OrderRefund> {
	const order = await OrderRefund.query().where('ext_return_hash', hash).first().catch(dberr);
	if (!order) {
		throw new BizException(msg.BIZ_ERR, 'get order by return hash failed: ' + hash);
	}
	return new Promise(resolve => {
		resolve(order);
	});
}

export async function handleEvent (orderEvent: OrderEvent): Promise<OrderEvent> {
	console.log('handleEvent----', orderEvent);
	switch (orderEvent.method) {
	case ShoppingOrderUpdated_: {
		const event = <ShoppingOrderUpdated>orderEvent;
		const order = await getOrderByOrderHash(event.ext_order_hash).catch(err => { throw err; });
		if (order.block_index >= event.index) {
			break;
		}
		const param = {
			shopping_agent: event.shopping_agent,
			payment_amount: event.payment_amount.toString(),
			tip: event.tip.toString(),
			return_amount: event.return_amount.toString(),
			required_deposit: event.required_deposit.toString(),
			required_credit: event.required_credit.toString(),
			is_return: event.is_return ? 1 : 0,
			block_index: event.index,
			onchain_status: event.status,
			utime: new Date().getTime()
		};
		await Order.query().findById(order.id).patch(param).catch(dberr);
		if (event.status === OrderStatus.Accepted) {
			await Order.query().findById(order.id).patch({ accept_time: new Date().getTime() }).catch(dberr);
		}
		if (event.status === OrderStatus.Shipping) {
			await Order.query().findById(order.id).patch({ shipping_time: new Date().getTime() }).catch(dberr);
		}
		if (event.status === OrderStatus.Received || event.status === OrderStatus.Closed || event.status === OrderStatus.Failed || event.status === OrderStatus.Archived) {
			await Order.query().findById(order.id).patch({ end_time: new Date().getTime() }).catch(dberr);
		}
		break;
	}
	case ReturnOrderUpdated_: {
		const event = <ReturnOrderUpdated>orderEvent;
		const order = await getOrderByReturnHash(event.ext_return_hash).catch(err => { throw err; });
		if (order.block_index >= event.index) {
			break;
		}
		if (event.status === ReturnStatus.Applied) {
			await OrderRefund.query().findById(order.id).patch({ onchain_status: event.status, utime: new Date().getTime(), block_index: event.index }).catch(dberr);
		} else if (event.status === ReturnStatus.Accepted) {
			await OrderRefund.query().findById(order.id).patch({ onchain_status: event.status, accept_time: new Date().getTime(), utime: new Date().getTime(), block_index: event.index }).catch(dberr);
		} else if (event.status === ReturnStatus.Shipping) {
			await OrderRefund.query().findById(order.id).patch({ onchain_status: event.status, shipping_time: new Date().getTime(), utime: new Date().getTime(), block_index: event.index }).catch(dberr);
		} else if (event.status === ReturnStatus.Returned) {
			await OrderRefund.query().findById(order.id).patch({ onchain_status: event.status, end_time: new Date().getTime(), utime: new Date().getTime(), block_index: event.index }).catch(dberr);
		} else if (event.status === ReturnStatus.Refused || event.status === ReturnStatus.NoResponse || event.status === ReturnStatus.Closed || event.status === ReturnStatus.Archived) {
			await OrderRefund.query().findById(order.id).patch({ onchain_status: event.status, end_time: new Date().getTime(), utime: new Date().getTime(), block_index: event.index }).catch(dberr);
		}
		break;
	}
	case ClearShoppingOrder_: {
		const event = <ClearShoppingOrder>orderEvent;
		const order = await getOrderByOrderHash(event.ext_order_hash).catch(err => { throw err; });
		if (order.block_index >= event.index) {
			break;
		}
		const param = {
			onchain_status: event.status,
			end_time: new Date().getTime(),
			utime: new Date().getTime(),
			block_index: event.index
		};
		await Order.query().findById(order.id).patch(param).catch(dberr);
		break;
	}
	case ClearCommodityReturn_: {
		const event = <ClearCommodityReturn>orderEvent;
		const order = await getOrderByReturnHash(event.ext_return_hash).catch(err => { throw err; });
		if (order.block_index >= event.index) {
			break;
		}
		await OrderRefund.query().findById(order.id).patch({ onchain_status: event.status, end_time: new Date().getTime(), utime: new Date().getTime(), block_index: event.index }).catch(dberr);
		break;
	}
	default: {
		throw new BizException(msg.EVENT_ERR, 'not found method name: ' + orderEvent.method);
	}
	}
	return new Promise(resolve => {
		resolve(orderEvent);
	});
}

export const compareOrderStatus = function (s1: string, s2: string):boolean {
	return checkOrderStatus(s1) > checkOrderStatus(s2);
};

export const checkOrderStatus = function (s: string): number {
	if (!s || s.length === 0) {
		return -1;
	}
	switch (s) {
	case OrderStatus.Pending: {
		return 0;
	}
	case OrderStatus.Accepted: {
		return 1;
	}
	case OrderStatus.Shipping: {
		return 2;
	}
	case OrderStatus.Received: {
		return 3;
	}
	case OrderStatus.Returning: {
		return 4;
	}
	case OrderStatus.Closed: {
		return 5;
	}
	case OrderStatus.Failed: {
		return 6;
	}
	default: {
		throw new BizException(msg.EVENT_ERR, 'not found status name: ' + s);
	}
	}
};

export const checkReturnStatus = function (s: string): number {
	if (!s || s.length === 0) {
		return -1;
	}
	switch (s) {
	case ReturnStatus.Applied: {
		return 0;
	}
	case ReturnStatus.Accepted: {
		return 1;
	}
	case ReturnStatus.Refused: {
		return 2;
	}
	case ReturnStatus.Shipping: {
		return 3;
	}
	case ReturnStatus.Returned: {
		return 4;
	}
	case ReturnStatus.NoResponse: {
		return 5;
	}
	default: {
		throw new BizException(msg.EVENT_ERR, 'not found status name: ' + s);
	}
	}
};

const checkParam = function (method: string, param:string[], len: number):void {
	if (!param) {
		throw new BizException(msg.EVENT_ERR, method + ' invalid event param empty');
	}
	if (param.length !== len) {
		throw new BizException(msg.EVENT_ERR, method + ' invalid event param length: ' + param.length.toString() + ', target: ' + len.toString());
	}
};
