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

//! Generic assets benchmarking.

#![cfg(feature = "runtime-benchmarks")]

use super::*;

use frame_system::RawOrigin;
use frame_benchmarking::{benchmarks, account, whitelisted_caller};
use crate::Module as GenericAsset;

const SEED: u32 = 0;

benchmarks! {
	_ { }

	// Benchmark `transfer` extrinsic with the worst possible conditions:
	// Transfer will kill the sender account.
	// Transfer will create the recipient account.
	transfer {
		let caller: T::AccountId = whitelisted_caller();

		// spending asset id
		let asset_id = GenericAsset::<T>::spending_asset_id();
		let initial_balance = T::Balance::from(5_000_000);
		GenericAsset::<T>::set_free_balance(asset_id, &caller, initial_balance);

		let recipient: T::AccountId = account("recipient", 0, SEED);
		let transfer_amount = T::Balance::from(5_000_000);
	}: transfer(RawOrigin::Signed(caller.clone()), asset_id, recipient.clone(), transfer_amount)
	verify {
		assert_eq!(GenericAsset::<T>::free_balance(asset_id, &caller), Zero::zero());
		assert_eq!(GenericAsset::<T>::free_balance(asset_id, &recipient), transfer_amount);
	}

	// Benchmark `burn`, GA's create comes from ROOT account. This always creates an asset.
	// Mint some amount of new asset to an account and burn the asset from it.
	burn {
		let caller: T::AccountId = whitelisted_caller();
		let initial_balance = T::Balance::from(5_000_000);
		let asset_id = GenericAsset::<T>::next_asset_id();
		let permissions = PermissionLatest::<T::AccountId>::new(caller.clone());
		let asset_options :AssetOptions<T::Balance, T::AccountId> = AssetOptions {
			initial_issuance: initial_balance,
			permissions,
		};

		let _ = GenericAsset::<T>::create(
			RawOrigin::Root.into(),
			caller.clone(),
			asset_options,
			AssetInfo::default()
		);

		let account: T::AccountId = account("bob", 0, SEED);

		// Mint some asset to the account 'bob' so that 'bob' can burn those
		let mint_amount = T::Balance::from(5_000_000);
		let _ = GenericAsset::<T>::mint(RawOrigin::Signed(caller.clone()).into(), asset_id, account.clone(), mint_amount);

		let burn_amount = T::Balance::from(5_000_000);
	}: burn(RawOrigin::Signed(caller.clone()), asset_id, account.clone(), burn_amount)
	verify {
		assert_eq!(GenericAsset::<T>::free_balance(asset_id, &account), Zero::zero());
		assert_eq!(GenericAsset::<T>::total_issuance(asset_id), initial_balance);
	}

	// Benchmark `burn`, GA's create comes from ROOT account.
	create {
		let caller: T::AccountId = whitelisted_caller();
		let initial_balance = T::Balance::from(5_000_000);
		let permissions = PermissionLatest::<T::AccountId>::new(caller.clone());
		let asset_id = GenericAsset::<T>::next_asset_id();
		let asset_options :AssetOptions<T::Balance, T::AccountId> = AssetOptions {
			initial_issuance: initial_balance,
			permissions,
		};
	}: create(RawOrigin::Root, caller.clone(), asset_options, AssetInfo::default())
	verify {
		assert_eq!(GenericAsset::<T>::total_issuance(&asset_id), initial_balance);
		assert_eq!(GenericAsset::<T>::free_balance(asset_id, &caller.clone()), initial_balance);
	}

	// Benchmark `mint`, create asset from ROOT account.
	// Owner of the asset can then mint amount to 'recipient' account
	mint {
		let caller: T::AccountId = whitelisted_caller();
		let mint_to: T::AccountId = account("recipient", 0, SEED);
		let initial_balance = T::Balance::from(5_000_000);
		let asset_id = GenericAsset::<T>::next_asset_id();
		let permissions = PermissionLatest::<T::AccountId>::new(caller.clone());
		let asset_options :AssetOptions<T::Balance, T::AccountId> = AssetOptions {
			initial_issuance: initial_balance,
			permissions,
		};
		let _ = GenericAsset::<T>::create(
			RawOrigin::Root.into(),
			caller.clone(),
			asset_options,
			AssetInfo::default()
		);

		let mint_amount = T::Balance::from(1_000_000);
	}: mint(RawOrigin::Signed(caller.clone()), asset_id, mint_to.clone(), mint_amount )
	verify {
		let total_issuance = T::Balance::from(6_000_000);
		assert_eq!(GenericAsset::<T>::total_issuance(&asset_id), total_issuance);
		assert_eq!(GenericAsset::<T>::free_balance(asset_id, &mint_to.clone()), mint_amount);
	}

	// Benchmark `update_asset_info`, create asset from ROOT account.
	// Update the asset info
	update_asset_info {
		let caller: T::AccountId = whitelisted_caller();
		let web3_asset_info = AssetInfo::new(b"WEB3.0".to_vec(), 3);
		let initial_balance = T::Balance::from(5_000_000);
		let asset_id = GenericAsset::<T>::next_asset_id();
		let permissions = PermissionLatest::<T::AccountId>::new(caller.clone());
		let burn_amount = T::Balance::from(5_000);
		let asset_options :AssetOptions<T::Balance, T::AccountId> = AssetOptions {
			initial_issuance: initial_balance,
			permissions,
		};
		let _ = GenericAsset::<T>::create(
			RawOrigin::Root.into(),
			caller.clone(),
			asset_options,
			web3_asset_info.clone()
		);

		let web3_asset_info = AssetInfo::new(b"WEB3.1".to_vec(), 5);
	}: update_asset_info(RawOrigin::Signed(caller.clone()), asset_id, web3_asset_info.clone())
	verify {
		assert_eq!(GenericAsset::<T>::asset_meta(asset_id), web3_asset_info);
	}

	// Benchmark `update_permission`, create asset from ROOT account with 'update' permission.
	// Update permission to include update and mint
	update_permission {
		let caller: T::AccountId = whitelisted_caller();
		let initial_balance = T::Balance::from(5_000_000);
		let permissions = PermissionLatest {
			update: Owner::Address(caller.clone()),
			mint: Owner::None,
			burn: Owner::None,
		};

		let new_permission = PermissionLatest {
			update: Owner::Address(caller.clone()),
			mint: Owner::Address(caller.clone()),
			burn: Owner::None,
		};
		let asset_id = GenericAsset::<T>::next_asset_id();
		let asset_options :AssetOptions<T::Balance, T::AccountId> = AssetOptions {
			initial_issuance: initial_balance,
			permissions,
		};
		let _ = GenericAsset::<T>::create(
			RawOrigin::Root.into(),
			caller.clone(),
			asset_options,
			AssetInfo::default()
		);
	}: update_permission(RawOrigin::Signed(caller.clone()), asset_id, new_permission)
	verify {
		assert!(GenericAsset::<T>::check_permission(asset_id, &caller.clone(), &PermissionType::Mint));
		assert!(!GenericAsset::<T>::check_permission(asset_id, &caller, &PermissionType::Burn));
	}

	// Benchmark `create_reserved`, create reserved asset from ROOT account.
	create_reserved {
		let caller: T::AccountId = whitelisted_caller();
		let initial_balance = T::Balance::from(5_000_000);
		let permissions = PermissionLatest::<T::AccountId>::new(caller.clone());
		// create reserved asset with asset_id >= next_asset_id should fail so set the next asset id to some value
		<NextAssetId<T>>::put(T::AssetId::from(10001));
		let asset_id = T::AssetId::from(1000);
		let asset_options :AssetOptions<T::Balance, T::AccountId> = AssetOptions {
			initial_issuance: initial_balance,
			permissions,
		};
	}: create_reserved(RawOrigin::Root, asset_id, asset_options, AssetInfo::default())
	verify {
		assert_eq!(GenericAsset::<T>::total_issuance(&asset_id), initial_balance);
		assert_eq!(GenericAsset::<T>::free_balance(asset_id, &T::AccountId::default()), initial_balance);
		assert_eq!(asset_id,  T::AssetId::from(1000));
	}
}

#[cfg(test)]
mod tests {
	use super::*;
	use crate::mock::{ExtBuilder, Test};
	use frame_support::assert_ok;

	#[test]
	fn generic_asset_benchmark_test() {
		ExtBuilder::default().build().execute_with(|| {
			assert_ok!(test_benchmark_transfer::<Test>());
			assert_ok!(test_benchmark_burn::<Test>());
			assert_ok!(test_benchmark_create::<Test>());
			assert_ok!(test_benchmark_create_reserved::<Test>());
			assert_ok!(test_benchmark_mint::<Test>());
			assert_ok!(test_update_asset_info::<Test>());
			assert_ok!(test_update_permission::<Test>());
		});
	}
}
