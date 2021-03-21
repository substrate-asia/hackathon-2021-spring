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

import GetPlaceReq from '../dto/getPlaceReq';
import GetPlaceRes from '../dto/getPlaceRes';
import RemovePlaceReq from '../dto/removePlaceReq';
import RemovePlaceRes from '../dto/removePlaceRes';
import UpsetPlaceReq from '../dto/upsetPlaceReq';
import UpsetPlaceRes from '../dto/upsetPlaceRes';
import BizException from '../exceptions/BizException';
import Place from '../models/Place';
import { nextId } from '../snowflake';
import msg from '../utils/messages';
import { dberr } from '../utils/webx';

export default class PlaceService {
	public async ListPlace (req: GetPlaceReq): Promise<GetPlaceRes[]> {
		console.log(req);
		const list = await Place.query().where('userId', req.ctxUserId).where('state', 1).offset(req.offset).limit(req.limit).catch(dberr);
		if (!list) {
			throw new BizException(msg.BIZ_ERR, 'get place failed');
		}
		const result: GetPlaceRes[] = [];
		list.forEach(item => {
			result.push(new GetPlaceRes(item.id, item.name, item.mobile, item.address));
		});
		return new Promise(resolve => {
			resolve(result);
		});
	}

	public async GetPlace (req: GetPlaceReq): Promise<GetPlaceRes> {
		if (!req.id) {
			throw new BizException(msg.BIZ_ERR, 'id empty');
		}
		const place = await Place.query().where('id', req.id).where('userId', req.ctxUserId).where('state', 1).first().catch(dberr);
		if (!place) {
			throw new BizException(msg.BIZ_ERR, 'get place failed');
		}
		return new Promise(resolve => {
			resolve(new GetPlaceRes(place.id, place.name, place.mobile, place.address));
		});
	}

	public async UpsetPlace (req: UpsetPlaceReq): Promise<UpsetPlaceRes> {
		if (!req.name) {
			throw new BizException(msg.BIZ_ERR, 'name empty');
		}
		if (!req.mobile) {
			throw new BizException(msg.BIZ_ERR, 'mobile empty');
		}
		if (!req.address) {
			throw new BizException(msg.BIZ_ERR, 'address empty');
		}
		if (!req.id) {
			// const count = await Place.query().where('userId', req.ctxUserId).where('state', 1).resultSize();
			// if (count > 5) {
			// throw new BizException(msg.BIZ_ERR, 'no more than 5 places');
			// }
			const place = await Place.query().insert({
				address: req.address,
				ctime: new Date().getTime(),
				id: nextId(),
				mobile: req.mobile,
				name: req.name,
				userId: req.ctxUserId
			}).catch(dberr);
			if (place) {
				return Promise.resolve(new UpsetPlaceRes(place.id));
			} else {
				return Promise.reject(new Error('no new place created.'));
			}
		} else {
			const place = await Place.query().where('id', req.id).where('userId', req.ctxUserId).where('state', 1).first().catch(dberr);
			if (!place) {
				throw new BizException(msg.BIZ_ERR, 'get place failed');
			}
			await Place.query().findById(place.id).patch({ address: req.address, mobile: req.mobile, name: req.name, utime: new Date().getTime() }).catch(dberr);
			return Promise.resolve(new UpsetPlaceRes(place.id));
		}
	}

	public async RemovePlace (req: RemovePlaceReq): Promise<RemovePlaceRes> {
		if (!req.id) {
			throw new BizException(msg.BIZ_ERR, 'id empty');
		}
		const place = await Place.query().where('id', req.id).where('userId', req.ctxUserId).where('state', 1).first().catch(dberr);
		if (!place) {
			throw new BizException(msg.BIZ_ERR, 'get place failed');
		}
		await Place.query().findById(place.id).patch({ state: 0, utime: new Date().getTime() }).catch(dberr);
		return new Promise(resolve => {
			resolve(new RemovePlaceRes());
		});
	}
}
