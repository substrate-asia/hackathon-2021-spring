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

export default class ResDto<T> {
	constructor (c: string, m: string, d: T, t:number, s: string) {
		this.c = c;
		this.m = m;
		this.d = d;
		this.t = t;
		this.s = s;
	}

	c: string; // 业务代码,成功000000,业务失败100000
	m: string; // 操作提示信息
	d: T; // 响应数据实体
	t: number; // 响应时间戳,毫秒
	s: string; // 响应数据签名
}
