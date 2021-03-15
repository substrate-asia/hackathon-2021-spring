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
import * as redis from 'redis';

if (!process.env.REDIS_URL) {
	throw new Error('REDIS_URL is not set');
}

export const client = redis.createClient(process.env.REDIS_URL);

/**
 * get from redis
 *
 * @param key string
 *
 * @returns values string
 */
export const redisGet = (key: string): Promise<string | null> => new Promise((resolve, reject) => {
	client.get(key, (err: Error | null, value: string | null) => {
		if (err) {
			return reject(err);
		}

		resolve(value);
	});
});

/**
 * set key-value in redis
 *
 * @param key string
 * @param value string
 */
export const redisSet = (key: string, value: string): Promise<string> => new Promise((resolve, reject) => {
	client.set(key, value, (err: Error | null, reply: string) => {
		if (err) {
			return reject(err);
		}

		resolve(reply);
	});
});

/**
 * set key-value in redis with ttl(expiry in seconds)
 *
 * @param key string
 * @param ttl number in seconds
 * @param value string
 */
export const redisSetex = (key: string, ttl: number, value: string): Promise<string> => new Promise((resolve, reject) => {
	client.setex(key, ttl, value, (err: Error | null, reply: string) => {
		if (err) {
			return reject(err);
		}

		resolve(reply);
	});
});

/**
 * delete key from redis
 *
 * @param key string
 */
export const redisDel = (key: string): Promise<number> => new Promise((resolve, reject) => {
	client.del(key, (err, reply) => {
		if (err) {
			return reject(err);
		}

		resolve(reply);
	});
});
