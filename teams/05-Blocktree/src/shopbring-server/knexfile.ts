// Copyright 2019-2020 @paritytech/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dotenv from 'dotenv';

import { Config } from './src/types';

dotenv.config();

const config: Config = {
	development: {
		client: 'mysql2',
		connection: {
			database: 'shopbring-server',
			host: process.env.MYSQL_HOST,
			password: process.env.MYSQL_ROOT_PASSWORD,
			port: parseInt(process.env.MYSQL_PORT || '3306'),
			user: 'root'
		},
		migrations: {
			directory: `${__dirname}/migrations`
		}
	},
	test: {
		client: 'mysql2',
		connection: {
			database: 'shopbring-server-test',
			host: process.env.MYSQL_HOST,
			password: process.env.MYSQL_ROOT_PASSWORD,
			port: parseInt(process.env.MYSQL_PORT || '3306'),
			user: 'root'
		},
		migrations: {
			directory: `${__dirname}/migrations`
		}
	}
};

const env = process.env.NODE_ENV || 'development';
const connection = config[env];

if (!connection || !connection.connection) {
	console.log('open connection...', connection);
	throw new Error(`DB Connection not provided for env ${env}`);
}

export = connection;
