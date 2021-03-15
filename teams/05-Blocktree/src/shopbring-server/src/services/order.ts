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
import { transaction } from 'objection';

import AcceptRefundReq from '../dto/acceptRefundReq';
import AcceptRefundRes from '../dto/acceptRefundRes';
import ApplyOrderReq from '../dto/applyOrderReq';
import ApplyOrderRes from '../dto/applyOrderRes';
import ApplyRefundReq from '../dto/applyRefundReq';
import ApplyRefundRes from '../dto/applyRefundRes';
import CommodityVo from '../dto/commodityVo';
import GetEBPlatformReq from '../dto/getEBPlatformReq';
import GetEBPlatformRes from '../dto/getEBPlatformRes';
import GetOrderRefundReq from '../dto/getOrderRefundReq';
import GetOrderRefundRes from '../dto/getOrderRefundRes';
import GetOrderReq from '../dto/getOrderReq';
import GetOrderRes from '../dto/getOrderRes ';
import ShippingOrderReq from '../dto/shippingOrderReq';
import ShippingOrderRes from '../dto/shippingOrderRes';
import BizException from '../exceptions/BizException';
import Commodity from '../models/Commodity';
import CommodityRefund from '../models/CommodityRefund';
import EBPlatform from '../models/EBPlatform';
import Order from '../models/Order';
import OrderRefund from '../models/OrderRefund';
import Place from '../models/Place';
import { OrderStatus, ReturnStatus } from '../polkadot/types';
import { nextId } from '../snowflake';
import { Blake2Hash } from '../utils/blake2b';
import JSONObject from '../utils/json';
import msg from '../utils/messages';
import { valid_money, valid_number } from '../utils/regular';
import { dberr, getUserBySub, hasInt } from '../utils/webx';

function getOrderRes (order_type: number, order:Order, commodities: Commodity[]):GetOrderRes {
	const commodityResList:CommodityVo[] = [];
	for (let j = 0; j < commodities.length; j++) {
		const commodity = commodities[j];
		const commodityRes = new CommodityVo();
		commodityRes.id = commodity.id;
		commodityRes.skuid = commodity.skuid;
		commodityRes.name = commodity.name;
		commodityRes.url = commodity.url;
		commodityRes.img = commodity.img;
		commodityRes.amount = commodity.amount;
		commodityRes.price = commodity.price;
		commodityRes.total = commodity.total;
		commodityRes.note = commodity.note;
		commodityRes.options = new JSONObject<string[]>().parse(commodity.options);
		commodityResList.push(commodityRes);
	}
	const orderRes = new GetOrderRes();
	orderRes.order_id = order.id;
	orderRes.payment_amount = order.payment_amount;
	orderRes.tip = order.tip;
	orderRes.currency = order.currency;
	orderRes.create_time = order.create_time;
	orderRes.accept_time = order.accept_time;
	orderRes.end_time = order.end_time;
	orderRes.required_deposit = order.required_deposit;
	orderRes.required_credit = order.required_credit;
	orderRes.logistics_company = order.logistics_company;
	orderRes.shipping_num = order.shipping_num;
	if (order_type === 0) {
		orderRes.consumer = '******';
		orderRes.shopping_agent = '******';
		orderRes.receiver = '******';
		orderRes.receiver_phone = '******';
		orderRes.shipping_address = '******';
	} else {
		orderRes.consumer = order.consumer;
		orderRes.shopping_agent = order.shopping_agent;
		orderRes.receiver = order.receiver;
		orderRes.receiver_phone = order.receiver_phone;
		orderRes.shipping_address = order.shipping_address;
	}

	orderRes.is_return = order.is_return;
	orderRes.platform_name = order.platform_name;
	orderRes.platform_order_num = order.platform_order_num;
	orderRes.merchant = order.merchant;
	orderRes.note = order.note;
	orderRes.fare = order.fare;
	orderRes.total = order.total;
	orderRes.onchain_status = order.onchain_status;
	orderRes.ext_order_hash = order.ext_order_hash;
	orderRes.shipping_hash = order.shipping_hash;
	orderRes.version = order.version;
	orderRes.commodities = commodityResList;
	return orderRes;
}

function getOrderRefundRes (order:OrderRefund, commodities: CommodityRefund[]):GetOrderRefundRes {
	const commodityResList:CommodityVo[] = [];
	for (let j = 0; j < commodities.length; j++) {
		const commodity = commodities[j];
		const commodityRes = new CommodityVo();
		commodityRes.id = commodity.id;
		commodityRes.skuid = commodity.skuid;
		commodityRes.name = commodity.name;
		commodityRes.url = commodity.url;
		commodityRes.img = commodity.img;
		commodityRes.amount = commodity.amount;
		commodityRes.price = commodity.price;
		commodityRes.total = commodity.total;
		commodityRes.note = commodity.note;
		commodityRes.options = new JSONObject<string[]>().parse(commodity.options);
		commodityResList.push(commodityRes);
	}
	const orderRes = new GetOrderRefundRes();
	orderRes.order_id = order.id;
	orderRes.pay_order_id = order.o_id;
	orderRes.consumer = order.consumer;
	orderRes.shopping_agent = order.shopping_agent;
	orderRes.return_amount = order.return_amount;
	orderRes.create_time = order.create_time;
	orderRes.accept_time = order.accept_time;
	orderRes.end_time = order.end_time;
	orderRes.logistics_company = order.logistics_company;
	orderRes.shipping_num = order.shipping_num;
	orderRes.receiver = order.receiver;
	orderRes.receiver_phone = order.receiver_phone;
	orderRes.shipping_address = order.shipping_address;
	orderRes.return_type = order.return_type;
	orderRes.note = order.note;
	orderRes.total = order.total;
	orderRes.version = order.version;
	orderRes.onchain_status = order.onchain_status;
	orderRes.ext_order_hash = order.ext_order_hash;
	orderRes.ext_return_hash = order.ext_return_hash;
	orderRes.shipping_hash = order.shipping_hash;
	orderRes.commodities = commodityResList;
	return orderRes;
}

export default class OrderService {
	public async GetEBPlatform (req: GetEBPlatformReq): Promise<GetEBPlatformRes[]> {
		if (!req) {
			throw new BizException(msg.BIZ_ERR, 'request undefined');
		}
		const list = await EBPlatform.query().where('state', 1).offset(0).limit(30).catch(dberr);
		if (!list) {
			throw new BizException(msg.BIZ_ERR, 'get ebplatform failed');
		}
		const result:GetEBPlatformRes[] = [];
		for (let i = 0; i < list.length; i++) {
			const item = list[i];
			result[i] = new GetEBPlatformRes(item.id, item.name, item.url, item.introduction);
		}
		return new Promise(resolve => {
			resolve(result);
		});
	}

	public async GetOrder (req: GetOrderReq): Promise<GetOrderRes[]> {
		if (!hasInt(req.order_type, [0, 1, 2])) {
			throw new BizException(msg.BIZ_ERR, 'order_type empty');
		}
		let orders;
		if (req.order_type === 0) {
			if (!req.order_id) {
				orders = await Order.query().where('onchain_status', OrderStatus.Pending).offset(req.offset).limit(req.limit).orderBy('create_time', 'desc').catch(dberr);
			} else {
				orders = await Order.query().where('id', req.order_id).where('onchain_status', OrderStatus.Pending).offset(req.offset).limit(req.limit).orderBy('create_time', 'desc').catch(dberr);
			}
		} else {
			const user = await getUserBySub(req.ctxUserId);
			const key = req.order_type === 1 ? 'consumer' : 'shopping_agent';
			if (!req.order_id) {
				orders = await Order.query().where(key, user.address).offset(req.offset).limit(req.limit).orderBy('create_time', 'desc').catch(dberr);
			} else {
				orders = await Order.query().where(key, user.address).where('id', req.order_id).offset(req.offset).limit(req.limit).orderBy('create_time', 'desc').catch(dberr);
			}
		}
		if (!orders) {
			throw new BizException(msg.BIZ_ERR, 'get order list failed');
		}
		const orderResList:GetOrderRes[] = [];
		for (let i = 0; i < orders.length; i++) {
			const order = orders[i];
			const commodities = await Commodity.query().where('o_id', order.id).catch(dberr);
			if (!commodities) {
				throw new BizException(msg.BIZ_ERR, 'get commodity list failed');
			}
			orderResList.push(getOrderRes(req.order_type, order, commodities));
		}

		return new Promise(resolve => {
			resolve(orderResList);
		});
	}

	public async GetOrderRefund (req: GetOrderRefundReq): Promise<GetOrderRefundRes[]> {
		if (!req.order_type || !hasInt(req.order_type, [1, 2])) {
			throw new BizException(msg.BIZ_ERR, 'order_type empty');
		}
		const user = await getUserBySub(req.ctxUserId);
		const key = req.order_type === 1 ? 'consumer' : 'shopping_agent';
		let orders;
		if (!req.order_id) {
			orders = await OrderRefund.query().where(key, user.address).offset(req.offset).limit(req.limit).catch(dberr);
		} else {
			orders = await OrderRefund.query().where(key, user.address).where('id', req.order_id).offset(req.offset).limit(req.limit).catch(dberr);
		}
		if (!orders) {
			throw new BizException(msg.BIZ_ERR, 'get order list failed');
		}
		const orderResList:GetOrderRefundRes[] = [];
		for (let i = 0; i < orders.length; i++) {
			const order = orders[i];
			const commodities = await CommodityRefund.query().where('refund_o_id', order.id).catch(dberr);
			if (!commodities) {
				throw new BizException(msg.BIZ_ERR, 'get commodity list failed');
			}
			orderResList.push(getOrderRefundRes(order, commodities));
		}

		return new Promise(resolve => {
			resolve(orderResList);
		});
	}

	public async ShippingOrder (req: ShippingOrderReq): Promise<ShippingOrderRes> {
		if (!hasInt(req.order_type, [1, 2])) {
			throw new BizException(msg.BIZ_ERR, 'order_type empty');
		}
		if (!req.order_id || !valid_number(req.order_id)) {
			throw new BizException(msg.BIZ_ERR, 'order_id empty');
		}
		if (!req.shipping_num) {
			throw new BizException(msg.BIZ_ERR, 'shipping_num empty');
		}
		const user = await getUserBySub(req.ctxUserId);
		if (req.order_type === 1) {
			const order = await Order.query().where('id', req.order_id).where('shopping_agent', user.address).first().catch(dberr);
			if (!order) {
				throw new BizException(msg.BIZ_ERR, 'get order failed');
			}
			if (order.onchain_status !== OrderStatus.Accepted) {
				throw new BizException(msg.DB_ERR, 'get order pay status not accepted');
			}
			const shipping_hash = new Blake2Hash().add([order.id, order.logistics_company, req.shipping_num, order.receiver, order.receiver_phone, order.shipping_address]).hash();
			const updated = await Order.query().findById(order.id).patch({ shipping_hash: shipping_hash, shipping_num: req.shipping_num, utime: new Date().getTime() }).catch(dberr);
			if (updated <= 0) {
				throw new BizException(msg.BIZ_ERR, 'save order failed');
			}
			return new Promise(resolve => {
				resolve(new ShippingOrderRes(order.shopping_agent, order.consumer, order.ext_order_hash, '', shipping_hash));
			});
		} else {
			const order = await OrderRefund.query().where('id', req.order_id).where('consumer', user.address).first().catch(dberr);
			if (!order) {
				throw new BizException(msg.BIZ_ERR, 'get order failed');
			}
			if (order.onchain_status !== ReturnStatus.Accepted) {
				throw new BizException(msg.DB_ERR, 'get order refund status not accepted');
			}
			const shipping_hash = new Blake2Hash().add([order.id, order.logistics_company, req.shipping_num, order.receiver, order.receiver_phone, order.shipping_address]).hash();
			const updated = await OrderRefund.query().findById(order.id).patch({ shipping_hash: shipping_hash, shipping_num: req.shipping_num, utime: new Date().getTime() }).catch(dberr);
			if (updated <= 0) {
				throw new BizException(msg.BIZ_ERR, 'save order failed');
			}
			return new Promise(resolve => {
				resolve(new ShippingOrderRes(order.shopping_agent, order.consumer, order.ext_order_hash, order.ext_return_hash, shipping_hash));
			});
		}
	}

	public async ApplyOrder (req: ApplyOrderReq): Promise<ApplyOrderRes> {
		if (!req.payment_amount || !valid_number(req.payment_amount)) {
			throw new BizException(msg.BIZ_ERR, 'payment_amount empty');
		}
		if (!req.tip || !valid_number(req.tip)) {
			throw new BizException(msg.BIZ_ERR, 'tip empty');
		}
		if (!req.currency || !valid_number(req.currency)) {
			throw new BizException(msg.BIZ_ERR, 'currency empty');
		}
		if (!req.required_deposit || !valid_number(req.required_deposit)) {
			throw new BizException(msg.BIZ_ERR, 'required_deposit empty');
		}
		if (!req.required_credit || !valid_number(req.required_credit)) {
			throw new BizException(msg.BIZ_ERR, 'required_credit empty');
		}
		if (!req.platform_id || !valid_number(req.platform_id)) {
			throw new BizException(msg.BIZ_ERR, 'platform_id empty');
		}
		if (!req.place_id || !valid_number(req.place_id)) {
			throw new BizException(msg.BIZ_ERR, 'place_id empty');
		}
		if (!req.total || !valid_money(req.total)) {
			throw new BizException(msg.BIZ_ERR, 'total empty');
		}
		if (!req.merchant) {
			throw new BizException(msg.BIZ_ERR, 'merchant empty');
		}
		if (!req.commodities || req.commodities.length === 0) {
			throw new BizException(msg.BIZ_ERR, 'commodities empty');
		}
		req.commodities.forEach(item => {
			if (!item.skuid) {
				throw new BizException(msg.BIZ_ERR, 'commodity skuid empty');
			}
			if (!item.name) {
				throw new BizException(msg.BIZ_ERR, 'commodity name empty');
			}
			if (!item.url) {
				throw new BizException(msg.BIZ_ERR, 'commodity url empty');
			}
			if (!item.amount || item.amount <= 0) {
				throw new BizException(msg.BIZ_ERR, 'commodity amount empty');
			}
			if (!item.price || !valid_money(item.price)) {
				throw new BizException(msg.BIZ_ERR, 'commodity price empty');
			}
			if (!item.total || !valid_money(item.total)) {
				throw new BizException(msg.BIZ_ERR, 'commodity total empty');
			}
			if (!item.note) {
				throw new BizException(msg.BIZ_ERR, 'commodity note empty');
			}
			if (!item.options || item.options.length === 0) {
				throw new BizException(msg.BIZ_ERR, 'commodity options empty');
			}
			item.options.forEach(item_o => {
				if (!item_o || item_o.length === 0) {
					throw new BizException(msg.BIZ_ERR, 'commodity options item empty');
				}
			});
		});
		const place = await Place.query().where('id', req.place_id).where('state', 1).first().catch(dberr);
		if (!place) {
			throw new BizException(msg.BIZ_ERR, 'get place failed');
		}
		const platform = await EBPlatform.query().where('id', req.platform_id).where('state', 1).first().catch(dberr);
		if (!platform) {
			throw new BizException(msg.BIZ_ERR, 'get platform failed');
		}
		const user = await getUserBySub(req.ctxUserId);
		const orderId = nextId();
		try {
			await transaction(Order, Commodity, async (Order, Commodity) => {
				/* eslint-disable sort-keys */
				const order = await Order.query().insert({
					id: orderId,
					userId: user.id,
					consumer: user.address,
					payment_amount: req.payment_amount,
					tip: req.tip,
					currency: req.currency,
					create_time: new Date().getTime(),
					required_deposit: req.required_credit,
					required_credit: req.required_credit,
					platform_id: platform.id,
					platform_name: platform.name,
					merchant: req.merchant,
					note: req.note,
					total: req.total,
					receiver: place.name,
					receiver_phone: place.mobile,
					shipping_address: place.address,
					onchain_status: OrderStatus.Applied,
					version: '0',
					ctime: new Date().getTime()
				}).catch(dberr);
				if (!order) {
					throw new BizException(msg.DB_ERR, 'save order failed');
				}
				const blake = new Blake2Hash().add([
					order.version,
					order.id,
					order.payment_amount,
					order.tip,
					order.currency,
					order.create_time.toString(),
					order.required_deposit,
					order.required_credit,
					order.platform_id,
					order.merchant,
					order.note
				]);
				for (let i = 0; i < req.commodities.length; i++) {
					const item = req.commodities[i];
					const commodity = await Commodity.query().insert({
						id: nextId(),
						skuid: item.skuid,
						o_id: order.id,
						name: item.name,
						url: item.url,
						img: item.img,
						options: new JSONObject<string[]>().stringify(item.options),
						amount: item.amount,
						price: item.price,
						total: item.total,
						note: item.note,
						ctime: new Date().getTime()
					}).catch(dberr);
					if (!commodity) {
						throw new BizException(msg.DB_ERR, 'save commodity failed');
					}
					blake.add([
						commodity.id,
						commodity.name,
						commodity.url,
						commodity.options,
						commodity.amount.toString(),
						commodity.price,
						commodity.total,
						commodity.note
					]);
				}
				order.ext_order_hash = blake.hash();
				const updated = await Order.query().findById(order.id).patch({ ext_order_hash: order.ext_order_hash }).catch(dberr);
				if (updated <= 0) {
					throw new BizException(msg.DB_ERR, 'update order hash failed');
				}
			});
		} catch (err) {
			throw new BizException(msg.DB_ERR, err);
		}
		const order = await Order.query().findById(orderId).first().catch(dberr);
		if (!order) {
			throw new BizException(msg.DB_ERR, 'get order failed');
		}
		return new Promise(resolve => {
			resolve(new ApplyOrderRes(order.consumer, order.payment_amount, order.tip, order.currency, order.required_deposit, order.required_credit, order.version, order.ext_order_hash));
		});
	}

	public async ApplyRefund (req: ApplyRefundReq): Promise<ApplyRefundRes> {
		if (!req.o_id || !valid_number(req.o_id)) {
			throw new BizException(msg.BIZ_ERR, 'o_id empty');
		}
		if (!req.return_amount || !valid_number(req.return_amount)) {
			throw new BizException(msg.BIZ_ERR, 'return_amount empty');
		}
		if (!req.total || !valid_money(req.total)) {
			throw new BizException(msg.BIZ_ERR, 'total empty');
		}
		if (!hasInt(req.return_type, [0, 1])) {
			throw new BizException(msg.BIZ_ERR, 'return_type empty');
		}
		if (!req.return_commodities || req.return_commodities.length === 0) {
			throw new BizException(msg.BIZ_ERR, 'return_commodities empty');
		}
		req.return_commodities.forEach(item => {
			if (!item.id) {
				throw new BizException(msg.BIZ_ERR, 'commodity id empty');
			}
			if (!item.amount || item.amount <= 0) {
				throw new BizException(msg.BIZ_ERR, 'commodity amount empty');
			}
			if (!item.price || !valid_money(item.price)) {
				throw new BizException(msg.BIZ_ERR, 'commodity price empty');
			}
			if (!item.total || !valid_money(item.total)) {
				throw new BizException(msg.BIZ_ERR, 'commodity total empty');
			}
		});
		const order_pay = await Order.query().where('id', req.o_id).first().catch(dberr);
		if (!order_pay) {
			throw new BizException(msg.BIZ_ERR, 'get order failed');
		}
		if (order_pay.onchain_status !== OrderStatus.Shipping) {
			throw new BizException(msg.BIZ_ERR, 'order refund is not supported');
		}
		const user = await getUserBySub(req.ctxUserId);
		const orderId = nextId();
		try {
			await transaction(OrderRefund, CommodityRefund, async (OrderRefund, CommodityRefund) => {
				/* eslint-disable sort-keys */
				const order_refund = await OrderRefund.query().insert({
					id: orderId,
					userId: user.id,
					consumer: user.address,
					shopping_agent: order_pay.shopping_agent,
					o_id: order_pay.id,
					return_amount: req.return_amount,
					create_time: new Date().getTime(),
					return_type: req.return_type,
					return_reason: req.return_reason,
					note: req.note,
					total: req.total,
					version: '0',
					ctime: new Date().getTime()
				}).catch(dberr);
				if (!order_refund) {
					throw new BizException(msg.DB_ERR, 'save order refund failed');
				}
				const blake = new Blake2Hash().add([
					order_refund.version,
					order_refund.id,
					order_refund.o_id,
					order_refund.return_amount,
					order_refund.create_time.toString(),
					order_refund.total,
					order_refund.note,
					order_refund.return_type.toString(),
					order_refund.return_reason
				]);
				for (let i = 0; i < req.return_commodities.length; i++) {
					const item = req.return_commodities[i];
					const p_commodity = await Commodity.query().where('id', item.id).where('o_id', order_refund.o_id).first().catch(dberr);
					if (!p_commodity) {
						throw new BizException(msg.DB_ERR, 'get commodity failed');
					}
					const commodity = await CommodityRefund.query().insert({
						id: nextId(),
						refund_o_id: order_refund.id,
						o_id: p_commodity.o_id,
						skuid: p_commodity.skuid,
						commodity_id: p_commodity.id,
						name: p_commodity.name,
						url: p_commodity.url,
						img: p_commodity.img,
						options: p_commodity.options,
						amount: item.amount,
						price: item.price,
						total: item.total,
						ctime: new Date().getTime()
					}).catch(dberr);
					if (!commodity) {
						throw new BizException(msg.DB_ERR, 'save commodity refund failed');
					}
					blake.add([
						commodity.commodity_id,
						commodity.amount.toString(),
						commodity.price,
						commodity.total
					]);
				}
				order_refund.ext_order_hash = order_pay.ext_order_hash;
				order_refund.ext_return_hash = blake.hash();
				const updated = await OrderRefund.query().findById(order_refund.id).patch({ ext_order_hash: order_refund.ext_order_hash, ext_return_hash: order_refund.ext_return_hash }).catch(dberr);
				if (updated <= 0) {
					throw new BizException(msg.DB_ERR, 'update order refund hash failed');
				}
			});
		} catch (err) {
			throw new BizException(msg.DB_ERR, err);
		}
		const order_refund = await OrderRefund.query().findById(orderId).first().catch(dberr);
		if (!order_refund) {
			throw new BizException(msg.DB_ERR, 'get order refund failed');
		}
		return new Promise(resolve => {
			resolve(new ApplyRefundRes(order_refund.consumer, order_refund.shopping_agent, order_refund.return_amount, order_refund.version, order_refund.ext_order_hash, order_refund.ext_return_hash));
		});
	}

	public async AcceptRefund (req: AcceptRefundReq): Promise<AcceptRefundRes> {
		if (!hasInt(req.accept_refund, [0, 1])) {
			throw new BizException(msg.BIZ_ERR, 'accept_refund empty');
		}
		if (!req.order_id || !valid_number(req.order_id)) {
			throw new BizException(msg.BIZ_ERR, 'order_id empty');
		}
		const user = await getUserBySub(req.ctxUserId);
		const order_refund = await OrderRefund.query().where('id', req.order_id).where('shopping_agent', user.address).first().catch(dberr);
		if (!order_refund) {
			throw new BizException(msg.DB_ERR, 'get order refund failed');
		}
		if (order_refund.onchain_status !== ReturnStatus.Applied) {
			throw new BizException(msg.DB_ERR, 'get order pay status not Applied');
		}
		if (req.accept_refund === 1) {
			if (!req.place_id || !valid_number(req.place_id)) {
				throw new BizException(msg.BIZ_ERR, 'place_id empty');
			}
			const place = await Place.query().where('id', req.place_id).where('userId', req.ctxUserId).where('state', 1).first().catch(dberr);
			if (!place) {
				throw new BizException(msg.BIZ_ERR, 'get place failed');
			}
			const updated = await OrderRefund.query().findById(order_refund.id).patch({ receiver: place.name, receiver_phone: place.mobile, shipping_address: place.address, utime: new Date().getTime() }).catch(dberr);
			if (updated <= 0) {
				throw new BizException(msg.DB_ERR, 'update order refund failed');
			}
		}
		return new Promise(resolve => {
			resolve(new AcceptRefundRes(order_refund.consumer, order_refund.shopping_agent, order_refund.return_amount, order_refund.version, order_refund.ext_order_hash, order_refund.ext_return_hash));
		});
	}
}
