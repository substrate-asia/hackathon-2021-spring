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
import { Router } from 'express';

import * as order from './controllers/order';
import * as place from './controllers/place';
import * as scratch from './controllers/scratch';
import * as user from './controllers/user';

const router = Router();

router.get('/healthcheck', (req, res) => {
	res.end('ok');
});

// #用户模块
router.post('/user/nonce', user.Nonce);
router.post('/user/info', user.GetUser);
router.post('/user/login', user.login);
router.post('/user/register', user.Register);
router.get('/user/confirmMail', user.ConfirmMail);

// #订单模块
router.post('/order/ebplatform', order.GetEBPlatform);
router.post('/order/applyOrder', order.ApplyOrder);
router.post('/order/applyRefund', order.ApplyRefund);
router.post('/order/index', order.GetOrderIndex);
router.post('/order/list', order.GetOrder);
router.post('/order/listRefund', order.GetOrderRefund);
router.post('/order/shipping', order.ShippingOrder);

// #收货地址模块
router.post('/place/get', place.GetPlace);
router.post('/place/list', place.ListPlace);
router.post('/place/upset', place.UpsetPlace);
router.post('/place/del', place.RemovePlace);

router.post('/product/scratch', scratch.GetTaobao);

export default router;
