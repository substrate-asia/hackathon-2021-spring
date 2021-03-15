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
import { NextFunction, Request, Response } from 'express';

import ApplyOrderReq from '../dto/applyOrderReq';
import ApplyRefundReq from '../dto/applyRefundReq';
import GetEBPlatformReq from '../dto/getEBPlatformReq';
import GetOrderRefundReq from '../dto/getOrderRefundReq';
import GetOrderReq from '../dto/getOrderReq';
import ShippingOrderReq from '../dto/shippingOrderReq';
import OrderService from '../services/order';
import { errx, reqx, resx } from '../utils/webx';

const orderService = new OrderService();

export function GetEBPlatform (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<GetEBPlatformReq>(req, next);
	if (!req_) {
		return;
	}
	orderService.GetEBPlatform(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function GetOrder (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<GetOrderReq>(req, next);
	if (!req_) {
		return;
	}
	req_.order_type = req_.order_type === 0 ? 3 : req_.order_type;
	orderService.GetOrder(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function GetOrderIndex (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<GetOrderReq>(req, next);
	if (!req_) {
		return;
	}
	req_.order_type = 0;
	orderService.GetOrder(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function GetOrderRefund (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<GetOrderRefundReq>(req, next);
	if (!req_) {
		return;
	}
	orderService.GetOrderRefund(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function ApplyOrder (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<ApplyOrderReq>(req, next);
	if (!req_) {
		return;
	}
	orderService.ApplyOrder(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function ApplyRefund (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<ApplyRefundReq>(req, next);
	if (!req_) {
		return;
	}
	orderService.ApplyRefund(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function ShippingOrder (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<ShippingOrderReq>(req, next);
	if (!req_) {
		return;
	}
	orderService.ShippingOrder(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

