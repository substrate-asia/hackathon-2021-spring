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

//! Mocks for the module.

#![cfg(test)]

use crate::{NegativeImbalance, PositiveImbalance};
use frame_support::{impl_outer_event, impl_outer_origin, parameter_types, weights::Weight};
use sp_core::H256;
use sp_runtime::{
	testing::Header,
	traits::{BlakeTwo256, IdentityLookup},
	Perbill,
};

use super::*;

// test accounts
pub const ALICE: u64 = 1;
pub const BOB: u64 = 2;
pub const CHARLIE: u64 = 3;

// staking asset id
pub const STAKING_ASSET_ID: u32 = 16000;
// spending asset id
pub const SPENDING_ASSET_ID: u32 = 16001;
// pre-existing asset 1
pub const TEST1_ASSET_ID: u32 = 16003;
// pre-existing asset 2
pub const TEST2_ASSET_ID: u32 = 16004;
// default next asset id
pub const ASSET_ID: u32 = 1000;

// initial issuance for creating new asset
pub const INITIAL_ISSUANCE: u64 = 1000;
// iniital balance for seting free balance
pub const INITIAL_BALANCE: u64 = 100;

impl_outer_origin! {
	pub enum Origin for Test  where system = frame_system {}
}

pub type PositiveImbalanceOf = PositiveImbalance<Test>;
pub type NegativeImbalanceOf = NegativeImbalance<Test>;

// For testing the pallet, we construct most of a mock runtime. This means
// first constructing a configuration type (`Test`) which `impl`s each of the
// configuration traits of pallets we want to use.
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Test;
parameter_types! {
	pub const BlockHashCount: u64 = 250;
	pub const MaximumBlockWeight: Weight = 1024;
	pub const MaximumBlockLength: u32 = 2 * 1024;
	pub const AvailableBlockRatio: Perbill = Perbill::one();
}
impl frame_system::Trait for Test {
	type BaseCallFilter = ();
	type Origin = Origin;
	type Index = u64;
	type BlockNumber = u64;
	type Call = ();
	type Hash = H256;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type BlockHashCount = BlockHashCount;
	type Event = TestEvent;
	type DbWeight = ();
	type BlockExecutionWeight = ();
	type ExtrinsicBaseWeight = ();
	type MaximumExtrinsicWeight = MaximumBlockWeight;
	type MaximumBlockWeight = MaximumBlockWeight;
	type MaximumBlockLength = MaximumBlockLength;
	type AvailableBlockRatio = AvailableBlockRatio;
	type Version = ();
	type PalletInfo = ();
	type AccountData = ();
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
}

impl Trait for Test {
	type Balance = u64;
	type AssetId = u32;
	type Event = TestEvent;
	type WeightInfo = ();
}

mod generic_asset {
	pub use crate::Event;
}

use frame_system as system;
impl_outer_event! {
	pub enum TestEvent for Test {
		system<T>,
		generic_asset<T>,
	}
}

pub type GenericAsset = Module<Test>;

pub type System = frame_system::Module<Test>;

pub struct ExtBuilder {
	asset_id: u32,
	next_asset_id: u32,
	accounts: Vec<u64>,
	initial_balance: u64,
	permissions: Vec<(u32, u64)>,
}

// Returns default values for genesis config
impl Default for ExtBuilder {
	fn default() -> Self {
		Self {
			asset_id: 0,
			next_asset_id: ASSET_ID,
			accounts: vec![0],
			initial_balance: 0,
			permissions: vec![],
		}
	}
}

impl ExtBuilder {
	// Sets free balance to genesis config
	pub fn free_balance(mut self, free_balance: (u32, u64, u64)) -> Self {
		self.asset_id = free_balance.0;
		self.accounts = vec![free_balance.1];
		self.initial_balance = free_balance.2;
		self
	}

	pub fn permissions(mut self, permissions: Vec<(u32, u64)>) -> Self {
		self.permissions = permissions;
		self
	}

	pub fn next_asset_id(mut self, asset_id: u32) -> Self {
		self.next_asset_id = asset_id;
		self
	}

	// builds genesis config
	pub fn build(self) -> sp_io::TestExternalities {
		let mut t = frame_system::GenesisConfig::default().build_storage::<Test>().unwrap();

		GenesisConfig::<Test> {
			assets: vec![self.asset_id],
			endowed_accounts: self.accounts,
			initial_balance: self.initial_balance,
			next_asset_id: self.next_asset_id,
			staking_asset_id: STAKING_ASSET_ID,
			spending_asset_id: SPENDING_ASSET_ID,
			permissions: self.permissions,
			asset_meta: vec![
				(TEST1_ASSET_ID, AssetInfo::new(b"TST1".to_vec(), 1)),
				(TEST2_ASSET_ID, AssetInfo::new(b"TST 2".to_vec(), 2)),
			],
		}
		.assimilate_storage(&mut t)
		.unwrap();

		t.into()
	}
}

// This function basically just builds a genesis storage key/value store according to
// our desired mockup.
pub fn new_test_ext() -> sp_io::TestExternalities {
	frame_system::GenesisConfig::default()
		.build_storage::<Test>()
		.unwrap()
		.into()
}
