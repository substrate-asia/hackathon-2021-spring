/*
 * Copyright (C) 2017-2021 blocktree.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /// TestNet Asset IDs.
pub mod asset {
	use primitives::AssetId;

	pub const SBG_ASSET_ID: AssetId = 1;	// Native token
	pub const CREDIT_VALUE_ID: AssetId = 2;		// Credit value
	pub const NEXT_ASSET_ID: AssetId = 100;

	pub const STAKING_ASSET_ID: AssetId = SBG_ASSET_ID;
	pub const SPENDING_ASSET_ID: AssetId = SBG_ASSET_ID;
}

/// Money matters.
pub mod currency {
	use primitives::Balance;

	pub const DOTS: Balance = 1_000_000_000_000;
	pub const DOLLARS: Balance = DOTS / 6;
	pub const CENTS: Balance = DOLLARS / 100;
	pub const MILLICENTS: Balance = CENTS / 1_000;

	pub const fn deposit(items: u32, bytes: u32) -> Balance {
		items as Balance * 20 * DOLLARS + (bytes as Balance) * 100 * MILLICENTS
	}
}

/// Time and blocks.
pub mod time {
	use primitives::{Moment, BlockNumber};
	// mainnet
	pub const MILLISECS_PER_BLOCK: Moment = 6000;
	// Testnet
//	pub const MILLISECS_PER_BLOCK: Moment = 1000;
	pub const SLOT_DURATION: Moment = MILLISECS_PER_BLOCK;
	// Kusama
	pub const EPOCH_DURATION_IN_BLOCKS: BlockNumber = 1 * HOURS;
	// Mainnet
//	pub const EPOCH_DURATION_IN_BLOCKS: BlockNumber = 4 * HOURS;
	// Testnet
//	pub const EPOCH_DURATION_IN_BLOCKS: BlockNumber = 10 * MINUTES;

	// These time units are defined in number of blocks.
	pub const MINUTES: BlockNumber = 60_000 / (MILLISECS_PER_BLOCK as BlockNumber);
	pub const HOURS: BlockNumber = MINUTES * 60;
	pub const DAYS: BlockNumber = HOURS * 24;

	// 1 in 4 blocks (on average, not counting collisions) will be primary babe blocks.
	pub const PRIMARY_PROBABILITY: (u64, u64) = (1, 4);
}