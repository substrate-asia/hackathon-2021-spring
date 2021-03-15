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

import GetPlaceReq from '../dto/getPlaceReq';
import RemovePlaceReq from '../dto/removePlaceReq';
import UpsetPlaceReq from '../dto/upsetPlaceReq';
import PlaceService from '../services/place';
import { errx, reqx, resx } from '../utils/webx';

const placeService = new PlaceService();

export function GetPlace (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<GetPlaceReq>(req, next);
	if (!req_) {
		return;
	}
	placeService.GetPlace(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function ListPlace (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<GetPlaceReq>(req, next);
	if (!req_) {
		return;
	}
	placeService.ListPlace(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function UpsetPlace (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<UpsetPlaceReq>(req, next);
	if (!req_) {
		return;
	}
	placeService.UpsetPlace(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

export function RemovePlace (req: Request, res: Response, next: NextFunction):void {
	const req_ = reqx<RemovePlaceReq>(req, next);
	if (!req_) {
		return;
	}
	placeService.RemovePlace(req_).then(ret => {
		resx(req, res, ret);
	}).catch(err => {
		errx(next, err);
	});
}

