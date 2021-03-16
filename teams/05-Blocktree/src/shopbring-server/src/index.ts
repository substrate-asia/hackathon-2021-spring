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
import chalk from 'chalk';
import dotenv from 'dotenv';

import app from './app';

dotenv.config();

// Start Express Server.
app.listen(app.get('port'), () => {
	console.log('%s App is running at http://localhost:%s in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
	console.log('Press CTRL-C to stop\n');
});
