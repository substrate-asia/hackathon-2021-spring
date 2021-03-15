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

//! Tests for the module.

#![cfg(test)]

use super::*;
use crate::mock::{
	new_test_ext, ExtBuilder, GenericAsset, NegativeImbalanceOf, Origin, PositiveImbalanceOf, System, Test, TestEvent,
	ALICE, ASSET_ID, BOB, CHARLIE, INITIAL_BALANCE, INITIAL_ISSUANCE, SPENDING_ASSET_ID, STAKING_ASSET_ID,
	TEST1_ASSET_ID, TEST2_ASSET_ID,
};
use frame_support::{assert_noop, assert_ok, traits::{Imbalance}};
use crate::CheckedImbalance;
fn asset_options(permissions: PermissionLatest<u64>) -> AssetOptions<u64, u64> {
	AssetOptions {
		initial_issuance: INITIAL_ISSUANCE,
		permissions,
	}
}

#[test]
fn issuing_asset_units_to_issuer_should_work() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);

			assert_eq!(GenericAsset::next_asset_id(), ASSET_ID);
			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::next_asset_id(), ASSET_ID + 1);

			assert_eq!(GenericAsset::total_issuance(&ASSET_ID), INITIAL_ISSUANCE);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_eq!(GenericAsset::free_balance(STAKING_ASSET_ID, &ALICE), INITIAL_BALANCE);
		});
}

#[test]
fn issuing_with_next_asset_id_overflow_should_fail() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			NextAssetId::<Test>::put(u32::max_value());

			assert_noop!(
				GenericAsset::create(Origin::root(), ALICE, asset_options(permissions), AssetInfo::default()),
				Error::<Test>::AssetIdExhausted
			);
			assert_eq!(GenericAsset::next_asset_id(), u32::max_value());
		});
}

#[test]
fn querying_total_supply_should_work() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let transfer_ammount = 50;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_eq!(GenericAsset::total_issuance(ASSET_ID), INITIAL_ISSUANCE);

			assert_ok!(GenericAsset::transfer(
				Origin::signed(ALICE),
				ASSET_ID,
				BOB,
				transfer_ammount
			));
			assert_eq!(
				GenericAsset::free_balance(ASSET_ID, &ALICE),
				INITIAL_ISSUANCE - transfer_ammount
			);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &BOB), transfer_ammount);
			assert_eq!(GenericAsset::total_issuance(ASSET_ID), INITIAL_ISSUANCE);

			assert_ok!(GenericAsset::transfer(
				Origin::signed(BOB),
				ASSET_ID,
				CHARLIE,
				transfer_ammount / 2
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &BOB), transfer_ammount / 2);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &CHARLIE), transfer_ammount / 2);
			assert_eq!(GenericAsset::total_issuance(ASSET_ID), INITIAL_ISSUANCE);
		});
}

// Given
// - The next asset id as `asset_id` = 1000.
// - AssetOptions with all permissions.
// - GenesisStore has sufficient free balance.
//
// When
// - Create an asset from `origin` as 1.
// Then
// - free_balance of next asset id = 1000.
//
// When
// - After transferring 40 from account 1 to account 2.
// Then
// - Origin account's `free_balance` = 60.
// - account 2's `free_balance` = 40.
#[test]
fn transferring_amount_should_work() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let transfer_ammount = 40;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_ok!(GenericAsset::transfer(
				Origin::signed(ALICE),
				ASSET_ID,
				BOB,
				transfer_ammount
			));
			assert_eq!(
				GenericAsset::free_balance(ASSET_ID, &ALICE),
				INITIAL_ISSUANCE - transfer_ammount
			);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &BOB), transfer_ammount);
		});
}

// Given
// - The next asset id as `asset_id` = 1000.
// - AssetOptions with all permissions.
// - GenesisStore has sufficient free balance.
//
// When
// - Create an asset from `origin` as 1.
// Then
// - free_balance of next asset id = 1000.
//
// When
// - After transferring amount more than free balance of 1.
// Then
// - throw error with insufficient balance.
#[test]
fn transferring_amount_more_than_free_balance_should_fail() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_noop!(
				GenericAsset::transfer(Origin::signed(ALICE), ASSET_ID, BOB, INITIAL_ISSUANCE + 1),
				Error::<Test>::InsufficientBalance
			);
		});
}

#[test]
fn transferring_less_than_one_unit_should_fail() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_noop!(
				GenericAsset::transfer(Origin::signed(ALICE), ASSET_ID, BOB, 0),
				Error::<Test>::ZeroAmount
			);
		});
}

// Given
// - Next asset id as `asset_id` = 1000.
// - Sufficient free balance.
// - initial balance = 100.
// When
// - After performing a self transfer from account 1 to 1.
// Then
// - Should not throw any errors.
// - Free balance after self transfer should equal to the free balance before self transfer.
#[test]
fn self_transfer_should_unchanged() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let transfer_ammount = 50;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_ok!(GenericAsset::transfer(
				Origin::signed(ALICE),
				ASSET_ID,
				ALICE,
				transfer_ammount
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_eq!(GenericAsset::total_issuance(ASSET_ID), INITIAL_ISSUANCE);
		});
}

#[test]
fn transferring_more_units_than_total_supply_should_fail() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::total_issuance(ASSET_ID), INITIAL_ISSUANCE);
			assert_noop!(
				GenericAsset::transfer(Origin::signed(ALICE), ASSET_ID, BOB, INITIAL_ISSUANCE + 1),
				Error::<Test>::InsufficientBalance
			);
		});
}

// Ensures it uses fake money for staking asset id.
#[test]
fn staking_asset_id_should_correct() {
	ExtBuilder::default().build().execute_with(|| {
		assert_eq!(GenericAsset::staking_asset_id(), STAKING_ASSET_ID);
	});
}

// Ensures it uses fake money for spending asset id.
#[test]
fn spending_asset_id_should_correct() {
	ExtBuilder::default().build().execute_with(|| {
		assert_eq!(GenericAsset::spending_asset_id(), SPENDING_ASSET_ID);
	});
}

// Given
// -Â Free balance is 0 and the reserved balance is 0.
// Then
// -Â total_balance should return 0
#[test]
fn total_balance_should_be_zero() {
	new_test_ext().execute_with(|| {
		assert_eq!(GenericAsset::total_balance(ASSET_ID, &ALICE), 0);
	});
}

// Given
// -Â Free balance is 100 and the reserved balance 0.
// -Reserved 50
// When
// - After calling total_balance.
// Then
// -Â total_balance should equals to free balance + reserved balance.
#[test]
fn total_balance_should_be_equal_to_account_balance() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let reserved_amount = 50;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_ok!(GenericAsset::reserve(ASSET_ID, &ALICE, reserved_amount));
			assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), reserved_amount);
			assert_eq!(
				GenericAsset::free_balance(ASSET_ID, &ALICE),
				INITIAL_ISSUANCE - reserved_amount
			);
			assert_eq!(GenericAsset::total_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
		});
}

// Given
// - An account presents with AccountId = 1
// -Â free_balance = 100.
// - Set reserved_balance = 50.
// When
// - After calling free_balance.
// Then
// -Â free_balance should return 50.
#[test]
fn free_balance_should_only_return_account_free_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 50);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_BALANCE);
		});
}

// Given
// - An account presents with AccountId = 1.
// -Â Free balance > 0 and the reserved balance > 0.
// When
// - After calling total_balance.
// Then
// -Â total_balance should equals to account balance + free balance.
#[test]
fn total_balance_should_be_equal_to_sum_of_account_balance_and_free_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 50);
			assert_eq!(GenericAsset::total_balance(ASSET_ID, &ALICE), INITIAL_BALANCE + 50);
		});
}

// Given
// -Â free_balance > 0.
// - reserved_balance = 70.
// When
// - After calling reserved_balance.
// Then
// - reserved_balance should return 70.
#[test]
fn reserved_balance_should_only_return_account_reserved_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 70);
			assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 70);
		});
}

// Given
// - A valid account presents.
// - Initial reserved_balance = 0
// When
// - After calls set_reserved_balance
// Then
// - Should persists the amount as reserved_balance.
// - reserved_balance = amount
#[test]
fn set_reserved_balance_should_add_balance_as_reserved() {
	ExtBuilder::default().build().execute_with(|| {
		GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 50);
		assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 50);
	});
}

// Given
// - A valid account presents.
// - Initial free_balance = 100.
// When
// - After calling set_free_balance.
// Then
// - Should persists the amount as free_balance.
// - New free_balance should replace older free_balance.
#[test]
fn set_free_balance_should_add_amount_as_free_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::set_free_balance(ASSET_ID, &ALICE, 50);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), 50);
		});
}

// Given
// - free_balance is greater than the account balance.
// - free_balance = 100
// - reserved_balance = 0
// - reserve amount = 70
// When
// - After calling reserve
// Then
// - Funds should be removed from the account.
// - new free_balance = original free_balance - reserved amount
// - new reserved_balance = original free balance + reserved amount
#[test]
fn reserve_should_moves_amount_from_balance_to_reserved_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			assert_ok!(GenericAsset::reserve(ASSET_ID, &ALICE, 70));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_BALANCE - 70);
			assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 70);
		});
}

// Given
// - Free balance is lower than the account balance.
// - free_balance = 100
// - reserved_balance = 0
// - reserve amount = 120
// When
// - After calling reverse function.
// Then
// - Funds should not be removed from the account.
// - Should throw an error.
#[test]
fn reserve_should_not_moves_amount_from_balance_to_reserved_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			assert_noop!(
				GenericAsset::reserve(ASSET_ID, &ALICE, INITIAL_BALANCE + 20),
				Error::<Test>::InsufficientBalance
			);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_BALANCE);
			assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 0);
		});
}

// Given
// - unreserved_amount > reserved_balance.
// - reserved_balance = 100.
// - free_balance = 100.
// - unreserved_amount = 120.
// When
// - After calling unreserve function.
// Then
// - unreserved should return 20.
#[test]
fn unreserve_should_return_subtracted_value_from_unreserved_amount_by_actual_account_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 100);
			assert_eq!(GenericAsset::unreserve(ASSET_ID, &ALICE, 120), 20);
		});
}

// Given
// - unreserved_amount < reserved_balance.
// - reserved_balance = 100.
// - free_balance = 100.
// - unreserved_amount = 50.
// When
// - After calling unreserve function.
// Then
// - unreserved should return None.
#[test]
fn unreserve_should_return_none() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 100);
			assert_eq!(GenericAsset::unreserve(ASSET_ID, &ALICE, 50), 0);
		});
}

// Given
// - unreserved_amount > reserved_balance.
// - reserved_balance = 100.
// - free_balance = 100.
// - unreserved_amount = 120.
// When
// - After calling unreserve function.
// Then
// - free_balance should be 200.
#[test]
fn unreserve_should_increase_free_balance_by_reserved_balance() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 100);
			GenericAsset::unreserve(ASSET_ID, &ALICE, 120);
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_BALANCE + 100);
		});
}

// Given
// - unreserved_amount > reserved_balance.
// - reserved_balance = 100.
// - free_balance = 100.
// - unreserved_amount = 120.
// When
// - After calling unreserve function.
// Then
// - reserved_balance should be 0.
#[test]
fn unreserve_should_deduct_reserved_balance_by_reserved_amount() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			GenericAsset::unreserve(ASSET_ID, &ALICE, 120);
			assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 0);
		});
}

// Given
// - slash amount < free_balance.
// - reserved_balance = 100.
// - free_balance = 100.
// - slash amount = 70.
// When
// - After calling slash function.
// Then
// - slash should return None.
#[test]
fn slash_should_return_slash_reserved_amount() {
	ExtBuilder::default()
		.free_balance((ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let reserved_amount = 100;
			let slash_amount = 70;
			GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, reserved_amount);
			assert_eq!(GenericAsset::slash(ASSET_ID, &ALICE, slash_amount), None);
			assert_eq!(
				GenericAsset::free_balance(ASSET_ID, &ALICE),
				INITIAL_BALANCE - slash_amount
			);
			assert_eq!(
				GenericAsset::total_balance(ASSET_ID, &ALICE),
				INITIAL_BALANCE + reserved_amount - slash_amount
			);
		});
}

// Given
// - slashed_amount > reserved_balance.
// When
// - After calling slashed_reverse function.
// Then
// - Should return slashed_reserved - reserved_balance.
#[test]
fn slash_reserved_should_deducts_up_to_amount_from_reserved_balance() {
	ExtBuilder::default().build().execute_with(|| {
		GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 100);
		assert_eq!(GenericAsset::slash_reserved(ASSET_ID, &ALICE, 150), Some(50));
		assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 0);
	});
}

// Given
// - slashed_amount equals to reserved_amount.
// When
// - After calling slashed_reverse function.
// Then
// - Should return None.
#[test]
fn slash_reserved_should_return_none() {
	ExtBuilder::default().build().execute_with(|| {
		GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 100);
		assert_eq!(GenericAsset::slash_reserved(ASSET_ID, &ALICE, 100), None);
		assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 0);
	});
}

// Given
// - reserved_balance = 100.
// - repatriate_reserved_amount > reserved_balance.
// When
// - After calling repatriate_reserved.
// Then
// - Should return `remaining`.
#[test]
fn repatriate_reserved_return_amount_subtracted_by_slash_amount() {
	ExtBuilder::default().build().execute_with(|| {
		GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 100);
		assert_ok!(GenericAsset::repatriate_reserved(ASSET_ID, &ALICE, &ALICE, 130), 30);
		assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), 100);
	});
}

// Given
// - reserved_balance = 100.
// - repatriate_reserved_amount < reserved_balance.
// When
// - After calling repatriate_reserved.
// Then
// - Should return zero.
#[test]
fn repatriate_reserved_return_none() {
	ExtBuilder::default().build().execute_with(|| {
		GenericAsset::set_reserved_balance(ASSET_ID, &ALICE, 100);
		assert_ok!(GenericAsset::repatriate_reserved(ASSET_ID, &ALICE, &ALICE, 90), 0);
		assert_eq!(GenericAsset::reserved_balance(ASSET_ID, &ALICE), 10);
		assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), 90);
	});
}

// Given
// - An asset with all permissions
// When
// - After calling `create_reserved` function.
// Then
// - Should create a new reserved asset.
#[test]
fn create_reserved_should_create_a_default_account_with_the_balance_given() {
	ExtBuilder::default().next_asset_id(1001).build().execute_with(|| {
		let permissions = PermissionLatest::new(ALICE);
		let options = asset_options(permissions);

		assert_ok!(GenericAsset::create_reserved(
			Origin::root(),
			ASSET_ID,
			options,
			AssetInfo::default()
		));
		assert_eq!(<TotalIssuance<Test>>::get(ASSET_ID), INITIAL_ISSUANCE);
		assert_eq!(<FreeBalance<Test>>::get(&ASSET_ID, &0), INITIAL_ISSUANCE);
	});
}

#[test]
fn create_reserved_with_non_reserved_asset_id_should_failed() {
	ExtBuilder::default().next_asset_id(999).build().execute_with(|| {
		let permissions = PermissionLatest::new(ALICE);
		let options = asset_options(permissions);

		// create reserved asset with asset_id >= next_asset_id should fail
		assert_noop!(
			GenericAsset::create_reserved(Origin::root(), ASSET_ID, options.clone(), AssetInfo::default()),
			Error::<Test>::AssetIdExists,
		);
	});
}

#[test]
fn create_reserved_with_a_taken_asset_id_should_failed() {
	ExtBuilder::default().next_asset_id(1001).build().execute_with(|| {
		let permissions = PermissionLatest::new(ALICE);
		let options = asset_options(permissions);

		// create reserved asset with asset_id < next_asset_id should success
		assert_ok!(GenericAsset::create_reserved(
			Origin::root(),
			ASSET_ID,
			options.clone(),
			AssetInfo::default()
		));
		assert_eq!(<TotalIssuance<Test>>::get(ASSET_ID), INITIAL_ISSUANCE);
		// all reserved assets belong to account: 0 which is the default value of `AccountId`
		assert_eq!(<FreeBalance<Test>>::get(&ASSET_ID, &0), INITIAL_ISSUANCE);
		// create reserved asset with existing asset_id: 9 should fail
		assert_noop!(
			GenericAsset::create_reserved(Origin::root(), ASSET_ID, options.clone(), AssetInfo::default()),
			Error::<Test>::AssetIdExists,
		);
	});
}

// Given
// - ALICE is signed
// - ALICE does not have minting permission
// When
// - After calling mint function
// Then
// - Should throw a permission error
#[test]
fn mint_without_permission_should_throw_error() {
	ExtBuilder::default().build().execute_with(|| {
		let amount = 100;

		assert_noop!(
			GenericAsset::mint(Origin::signed(ALICE), ASSET_ID, BOB, amount),
			Error::<Test>::NoMintPermission,
		);
	});
}

// Given
// - ALICE is signed.
// - ALICE has permissions.
// When
// - After calling mint function
// Then
// - Should increase `BOB` free_balance.
// - Should not change `origins` free_balance.
#[test]
fn mint_should_increase_asset() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let amount = 100;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_ok!(GenericAsset::mint(Origin::signed(ALICE), ASSET_ID, BOB, amount));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &BOB), amount);
			// Origin's free_balance should not change.
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &ALICE), INITIAL_ISSUANCE);
			assert_eq!(GenericAsset::total_issuance(ASSET_ID), INITIAL_ISSUANCE + amount);
		});
}

// Given
// - Origin is signed.
// - Origin does not have burning permission.
// When
// - After calling burn function.
// Then
// - Should throw a permission error.
#[test]
fn burn_should_throw_permission_error() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let amount = 100;

			assert_noop!(
				GenericAsset::burn(Origin::signed(ALICE), ASSET_ID, BOB, amount),
				Error::<Test>::NoBurnPermission,
			);
		});
}

// Given
// - Origin is signed.
// - Origin has permissions.
// When
// - After calling burn function
// Then
// - Should decrease `to`'s  free_balance.
// - Should not change `origin`'s  free_balance.
#[test]
fn burn_should_burn_an_asset() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let mint_amount = 100;
			let burn_amount = 40;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_ok!(GenericAsset::mint(Origin::signed(ALICE), ASSET_ID, BOB, mint_amount));
			assert_eq!(GenericAsset::total_issuance(ASSET_ID), INITIAL_ISSUANCE + mint_amount);

			assert_ok!(GenericAsset::burn(Origin::signed(ALICE), ASSET_ID, BOB, burn_amount));
			assert_eq!(GenericAsset::free_balance(ASSET_ID, &BOB), mint_amount - burn_amount);
			assert_eq!(
				GenericAsset::total_issuance(ASSET_ID),
				INITIAL_ISSUANCE + mint_amount - burn_amount
			);
		});
}

// Given
// - `default_permissions` with all privileges.
// - All permissions for origin.
// When
// - After executing create function and check_permission function.
// Then
// - The account origin should have burn, mint and update permissions.
#[test]
fn check_permission_should_return_correct_permission() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert!(GenericAsset::check_permission(ASSET_ID, &ALICE, &PermissionType::Burn));
			assert!(GenericAsset::check_permission(ASSET_ID, &ALICE, &PermissionType::Mint));
			assert!(GenericAsset::check_permission(
				ASSET_ID,
				&ALICE,
				&PermissionType::Update
			));
		});
}

// Given
// - `default_permissions` with no privileges.
// - No permissions for origin.
// When
// - After executing create function and check_permission function.
// Then
// - The account origin should not have burn, mint and update permissions.
#[test]
fn check_permission_should_return_false_for_no_permission() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::default();

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert!(!GenericAsset::check_permission(
				ASSET_ID,
				&ALICE,
				&PermissionType::Burn
			));
			assert!(!GenericAsset::check_permission(
				ASSET_ID,
				&ALICE,
				&PermissionType::Mint
			));
			assert!(!GenericAsset::check_permission(
				ASSET_ID,
				&ALICE,
				&PermissionType::Update
			));
		});
}

// Given
// - `default_permissions` only with update.
// When
// - After executing update_permission function.
// Then
// - The account origin should not have the burn permission.
// - The account origin should have update and mint permissions.
#[test]
fn update_permission_should_change_permission() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest {
				update: Owner::Address(ALICE),
				mint: Owner::None,
				burn: Owner::None,
			};

			let new_permission = PermissionLatest {
				update: Owner::Address(ALICE),
				mint: Owner::Address(ALICE),
				burn: Owner::None,
			};

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_ok!(GenericAsset::update_permission(
				Origin::signed(ALICE),
				ASSET_ID,
				new_permission
			));
			assert!(GenericAsset::check_permission(ASSET_ID, &ALICE, &PermissionType::Mint));
			assert!(!GenericAsset::check_permission(
				ASSET_ID,
				&ALICE,
				&PermissionType::Burn
			));
		});
}

// Given
// - `default_permissions` without any permissions.
// When
// - After executing update_permission function.
// Then
// - Should throw an error stating "Origin does not have enough permission to update permissions."
#[test]
fn update_permission_should_throw_error_when_lack_of_permissions() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::default();

			let new_permission = PermissionLatest {
				update: Owner::Address(ALICE),
				mint: Owner::Address(ALICE),
				burn: Owner::None,
			};

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_noop!(
				GenericAsset::update_permission(Origin::signed(ALICE), ASSET_ID, new_permission),
				Error::<Test>::NoUpdatePermission,
			);
		});
}

// Given
// - `asset_id` provided.
// - `from_account` is present.
// - All permissions for origin.
// When
// - After calling create_asset.
// Then
// - Should create a reserved token with provided id.
// - NextAssetId doesn't change.
// - TotalIssuance must equal to initial issuance.
// - FreeBalance must equal to initial issuance for the given account.
// - Permissions must have burn, mint and updatePermission for the given asset_id.
#[test]
fn create_asset_works_with_given_asset_id_and_from_account() {
	ExtBuilder::default().next_asset_id(1001).build().execute_with(|| {
		let from_account: Option<<Test as frame_system::Trait>::AccountId> = Some(ALICE);
		let permissions = PermissionLatest::new(ALICE);
		let expected_permission = PermissionVersions::V1(permissions.clone());

		assert_ok!(GenericAsset::create_asset(
			Some(ASSET_ID),
			from_account,
			asset_options(permissions),
			AssetInfo::default()
		));
		// Test for side effects.
		assert_eq!(<NextAssetId<Test>>::get(), 1001);
		assert_eq!(<TotalIssuance<Test>>::get(ASSET_ID), INITIAL_ISSUANCE);
		assert_eq!(<FreeBalance<Test>>::get(&ASSET_ID, &ALICE), INITIAL_ISSUANCE);
		assert_eq!(<Permissions<Test>>::get(&ASSET_ID), expected_permission);
	});
}

// Given
// - `asset_id` is an id for user generated assets.
// - Whatever other params.
// Then
// - `create_asset` should not work.
#[test]
fn create_asset_with_non_reserved_asset_id_should_fail() {
	ExtBuilder::default().next_asset_id(999).build().execute_with(|| {
		let permissions = PermissionLatest::new(ALICE);

		assert_noop!(
			GenericAsset::create_asset(
				Some(ASSET_ID),
				Some(ALICE),
				asset_options(permissions),
				AssetInfo::default()
			),
			Error::<Test>::AssetIdExists,
		);
	});
}

// Given
// - `asset_id` is for reserved assets, but already taken.
// - Whatever other params.
// Then
// - `create_asset` should not work.
#[test]
fn create_asset_with_a_taken_asset_id_should_fail() {
	ExtBuilder::default().next_asset_id(1001).build().execute_with(|| {
		let permissions = PermissionLatest::new(ALICE);

		assert_ok!(GenericAsset::create_asset(
			Some(ASSET_ID),
			Some(ALICE),
			asset_options(permissions.clone()),
			AssetInfo::default()
		));
		assert_noop!(
			GenericAsset::create_asset(
				Some(ASSET_ID),
				Some(ALICE),
				asset_options(permissions),
				AssetInfo::default()
			),
			Error::<Test>::AssetIdExists,
		);
	});
}

// Given
// - `asset_id` provided.
// - `from_account` is None.
// - All permissions for origin.
// When
// - After calling create_asset.
// Then
// - Should create a reserved token.
#[test]
fn create_asset_should_create_a_reserved_asset_when_from_account_is_none() {
	ExtBuilder::default().next_asset_id(1001).build().execute_with(|| {
		let from_account: Option<<Test as frame_system::Trait>::AccountId> = None;
		let permissions = PermissionLatest::new(ALICE);
		let created_account_id = 0;

		assert_ok!(GenericAsset::create_asset(
			Some(ASSET_ID),
			from_account,
			asset_options(permissions.clone()),
			AssetInfo::default()
		));

		// Test for a side effect.
		assert_eq!(
			<FreeBalance<Test>>::get(&ASSET_ID, &created_account_id),
			INITIAL_ISSUANCE
		);
	});
}

// Given
// - `asset_id` not provided.
// - `from_account` is None.
// - All permissions for origin.
// When
// - After calling create_asset.
// Then
// - Should create a user token.
// - `NextAssetId`'s get should return a new value.
// - Should not create a `reserved_asset`.
#[test]
fn create_asset_should_create_a_user_asset() {
	ExtBuilder::default().build().execute_with(|| {
		let from_account: Option<<Test as frame_system::Trait>::AccountId> = None;
		let permissions = PermissionLatest::new(ALICE);
		let reserved_asset_id = 1001;

		assert_ok!(GenericAsset::create_asset(
			None,
			from_account,
			asset_options(permissions),
			AssetInfo::default()
		));

		// Test for side effects.
		assert_eq!(<FreeBalance<Test>>::get(&reserved_asset_id, &ALICE), 0);
		assert_eq!(<FreeBalance<Test>>::get(&ASSET_ID, &0), INITIAL_ISSUANCE);
		assert_eq!(<TotalIssuance<Test>>::get(ASSET_ID), INITIAL_ISSUANCE);
	});
}

#[test]
fn update_permission_should_raise_event() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions.clone()),
				AssetInfo::default()
			));
			assert_ok!(GenericAsset::update_permission(
				Origin::signed(ALICE),
				ASSET_ID,
				permissions.clone()
			));

			let expected_event = TestEvent::generic_asset(RawEvent::PermissionUpdated(ASSET_ID, permissions));
			assert!(System::events().iter().any(|record| record.event == expected_event));
		});
}

#[test]
fn mint_should_raise_event() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let amount = 100;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_ok!(GenericAsset::mint(Origin::signed(ALICE), ASSET_ID, BOB, amount));

			let expected_event = TestEvent::generic_asset(RawEvent::Minted(ASSET_ID, BOB, amount));
			assert!(System::events().iter().any(|record| record.event == expected_event));
		});
}

#[test]
fn burn_should_raise_event() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let permissions = PermissionLatest::new(ALICE);
			let amount = 100;

			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(permissions),
				AssetInfo::default()
			));
			assert_ok!(GenericAsset::burn(Origin::signed(ALICE), ASSET_ID, ALICE, amount));

			let expected_event = TestEvent::generic_asset(RawEvent::Burned(ASSET_ID, ALICE, amount));
			assert!(System::events().iter().any(|record| record.event == expected_event));
		});
}

#[test]
fn can_set_asset_owner_permissions_in_genesis() {
	ExtBuilder::default()
		.permissions(vec![(ASSET_ID, ALICE)])
		.build()
		.execute_with(|| {
			let expected: PermissionVersions<_> = PermissionsV1::new(ALICE).into();
			let actual = GenericAsset::get_permission(ASSET_ID);
			assert_eq!(expected, actual);
		});
}

#[test]
fn zero_asset_id_should_updated_after_negative_imbalance_operations() {
	let asset_id = 16000;
	ExtBuilder::default().build().execute_with(|| {
		// generate empty negative imbalance
		let negative_im = NegativeImbalanceOf::zero();
		let other = NegativeImbalanceOf::new(100, asset_id);
		assert_eq!(negative_im.asset_id(), 0);
		assert_eq!(negative_im.peek(), 0);
		assert_eq!(other.asset_id(), asset_id);
		// zero asset id should updated after merge
		let merged_im = negative_im.checked_merge(other).unwrap();
		assert_eq!(merged_im.asset_id(), asset_id);
		assert_eq!(merged_im.peek(), 100);

		let negative_im =  NegativeImbalanceOf::new(100, asset_id);
		let other = NegativeImbalanceOf::new(100, asset_id);
		// If assets are same, the amount can be merged safely
		let merged_im = negative_im.checked_merge(other).unwrap();
		assert_eq!(merged_im.asset_id(), asset_id);
		assert_eq!(merged_im.peek(), 200);

		// merge other with same asset id should work
		let other = NegativeImbalanceOf::new(100, asset_id);
		let merged_im = merged_im.checked_merge(other).unwrap();
		assert_eq!(merged_im.peek(), 300);

		let mut negative_im = NegativeImbalanceOf::zero();
		assert_eq!(negative_im.asset_id(), 0);
		let other = NegativeImbalanceOf::new(100, asset_id);
		// zero asset id should updated after subsume
		negative_im.checked_subsume(other).unwrap();
		assert_eq!(negative_im.asset_id(), asset_id);
		assert_eq!(negative_im.peek(), 100);

		negative_im =  NegativeImbalanceOf::new(100, asset_id);
		// subsume other with same asset id should work
		let other = NegativeImbalanceOf::new(100, asset_id);
		negative_im.checked_subsume(other).unwrap();
		assert_eq!(negative_im.peek(), 200);

		// offset opposite im with same asset id should work
		let offset_im = NegativeImbalanceOf::new(100, asset_id);
		let opposite_im = PositiveImbalanceOf::new(25, asset_id);
		let offset_im = offset_im.checked_offset(opposite_im);
		assert!(offset_im.is_ok());
	});
}

#[test]
fn zero_asset_id_should_updated_after_positive_imbalance_operations() {
	let asset_id = 16000;
	ExtBuilder::default().build().execute_with(|| {
		// generate empty positive imbalance
		let positive_im = PositiveImbalanceOf::zero();
		let other = PositiveImbalanceOf::new(100, asset_id);
		assert_eq!(positive_im.asset_id(), 0);
		assert_eq!(positive_im.peek(), 0);
		// zero asset id should updated after merge
		let merged_im = positive_im.checked_merge(other).unwrap();
		assert_eq!(merged_im.asset_id(), asset_id);
		assert_eq!(merged_im.peek(), 100);

		let positive_im =  PositiveImbalanceOf::new(10, asset_id);
		let other = PositiveImbalanceOf::new(100, asset_id);
		// If assets are same, the amount can be merged safely
		let merged_im = positive_im.checked_merge(other).unwrap();
		assert_eq!(merged_im.asset_id(), asset_id);
		assert_eq!(merged_im.peek(), 110);

		let other = PositiveImbalanceOf::new(100, asset_id);
		let merged_im = merged_im.checked_merge(other).unwrap();
		assert_eq!(merged_im.peek(), 210);

		// subsume
		let mut positive_im = PositiveImbalanceOf::zero();
		let other = PositiveImbalanceOf::new(100, asset_id);
		// zero asset id should updated after subsume
		positive_im.checked_subsume(other).unwrap();
		assert_eq!(positive_im.asset_id(), asset_id);
		assert_eq!(positive_im.peek(), 100);

		positive_im =  PositiveImbalanceOf::new(100, asset_id);
		// subsume other with same asset id should work
		let other = PositiveImbalanceOf::new(100, asset_id);
		positive_im.checked_subsume(other).unwrap();
		assert_eq!(positive_im.peek(), 200);

		let positive_im = PositiveImbalanceOf::new(100, asset_id);
		let opposite_im = NegativeImbalanceOf::new(150, asset_id);
		assert_ok!(positive_im.checked_offset(opposite_im));

		// offset opposite im with same asset id should work
		let offset_im = PositiveImbalanceOf::new(100, asset_id);
		let opposite_im = NegativeImbalanceOf::new(25, asset_id);
		assert_ok!(offset_im.checked_offset(opposite_im));
	});
}

#[test]
fn negative_imbalance_merge_with_incompatible_asset_id_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		// create two mew imbalances with different asset id
		let negative_im = NegativeImbalanceOf::new(100, 1);
		let other = NegativeImbalanceOf::new(50, 2);
		assert_eq!(
			negative_im.checked_merge(other).unwrap_err(),
			imbalances::Error::DifferentAssetIds,
		);
		let negative_im = NegativeImbalanceOf::new(100, 0);
		let other = NegativeImbalanceOf::new(50, 2);
		assert_eq!(
			negative_im.checked_merge(other).unwrap_err(),
			imbalances::Error::ZeroIdWithNonZeroAmount,
		);
	});
}

#[test]
fn positive_imbalance_merge_with_incompatible_asset_id_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		// create two mew imbalances with different asset id
		let positive_im = PositiveImbalanceOf::new(100, 1);
		let other = PositiveImbalanceOf::new(50, 2);
		// merge
		assert_eq!(
			positive_im.checked_merge(other).unwrap_err(),
			imbalances::Error::DifferentAssetIds,
		);
		let positive_im = PositiveImbalanceOf::new(100, 0);
		let other = PositiveImbalanceOf::new(50, 2);
		assert_eq!(
			positive_im.checked_merge(other).unwrap_err(),
			imbalances::Error::ZeroIdWithNonZeroAmount,
		);
	});
}

#[test]
fn negative_imbalance_subsume_with_incompatible_asset_id_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		// create two mew imbalances with different asset id
		let mut negative_im = NegativeImbalanceOf::new(100, 1);
		let other = NegativeImbalanceOf::new(50, 2);
		// subsume
		assert_eq!(
			negative_im.checked_subsume(other).unwrap_err(),
			imbalances::Error::DifferentAssetIds,
		);
		negative_im = NegativeImbalanceOf::new(10, 0);
		let other = NegativeImbalanceOf::new(50, 2);
		// subsume
		assert_eq!(
			negative_im.checked_subsume(other).unwrap_err(),
			imbalances::Error::ZeroIdWithNonZeroAmount,
		);
	});
}

#[test]
fn positive_imbalance_subsume_with_incompatible_asset_id_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		// create two mew imbalances with different asset id
		let mut positive_im = PositiveImbalanceOf::new(100, 1);
		let other = PositiveImbalanceOf::new(50, 2);
		// subsume
		assert_eq!(
			positive_im.checked_subsume(other).unwrap_err(),
			imbalances::Error::DifferentAssetIds,
		);
		positive_im = PositiveImbalanceOf::new(100, 0);
		let other = PositiveImbalanceOf::new(50, 2);
		// subsume
		assert_eq!(
			positive_im.checked_subsume(other).unwrap_err(),
			imbalances::Error::ZeroIdWithNonZeroAmount,
		);
	});
}

#[test]
fn negative_imbalance_offset_with_incompatible_asset_id_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		// create two mew imbalances with different asset id
		let negative_im = NegativeImbalanceOf::new(100, 1);
		let opposite_im = PositiveImbalanceOf::new(50, 2);
		assert_eq!(
			negative_im.checked_offset(opposite_im).unwrap_err(),
			imbalances::Error::DifferentAssetIds,
		);
		let negative_im = NegativeImbalanceOf::new(100, 0);
		let opposite_im = PositiveImbalanceOf::new(50, 2);
		assert_eq!(
			negative_im.checked_offset(opposite_im).unwrap_err(),
			imbalances::Error::ZeroIdWithNonZeroAmount,
		);
	});
}

#[test]
fn positive_imbalance_offset_with_incompatible_asset_id_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		// create two mew imbalances with different asset id
		let positive_im = PositiveImbalanceOf::new(100, 1);
		let opposite_im = NegativeImbalanceOf::new(50, 2);
		assert_eq!(
			positive_im.checked_offset(opposite_im).unwrap_err(),
			imbalances::Error::DifferentAssetIds,
		);
		let positive_im = PositiveImbalanceOf::new(100, 0);
		let opposite_im = NegativeImbalanceOf::new(50, 2);
		assert_eq!(
			positive_im.checked_offset(opposite_im).unwrap_err(),
			imbalances::Error::ZeroIdWithNonZeroAmount,
		);
	});
}

#[test]
fn total_issuance_should_update_after_positive_imbalance_dropped() {
	let asset_id = 16000;
	let balance = 100000;
	ExtBuilder::default()
		.free_balance((asset_id, 1, balance))
		.build()
		.execute_with(|| {
			assert_eq!(GenericAsset::total_issuance(&asset_id), balance);
			// generate empty positive imbalance
			let positive_im = PositiveImbalanceOf::new(0, asset_id);
			let other = PositiveImbalanceOf::new(100, asset_id);
			// merge
			let merged_im = positive_im.checked_merge(other);
			// explitically drop `imbalance` so issuance is managed
			drop(merged_im);
			assert_eq!(GenericAsset::total_issuance(&asset_id), balance + 100);
		});
}

#[test]
fn total_issuance_should_update_after_negative_imbalance_dropped() {
	let asset_id = 16000;
	let balance = 100000;
	ExtBuilder::default()
		.free_balance((asset_id, 1, balance))
		.build()
		.execute_with(|| {
			assert_eq!(GenericAsset::total_issuance(&asset_id), balance);
			// generate empty positive imbalance
			let positive_im = NegativeImbalanceOf::new(0, asset_id);
			let other = NegativeImbalanceOf::new(100, asset_id);
			// merge
			let merged_im = positive_im.checked_merge(other);
			// explitically drop `imbalance` so issuance is managed
			drop(merged_im);
			assert_eq!(GenericAsset::total_issuance(&asset_id), balance - 100);
		});
}

#[test]
fn query_pre_existing_asset_info() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			assert_eq!(
				GenericAsset::registered_assets(),
				vec![
					(TEST1_ASSET_ID, AssetInfo::new(b"TST1".to_vec(), 1)),
					(TEST2_ASSET_ID, AssetInfo::new(b"TST 2".to_vec(), 2))
				]
			);
		});
}

#[test]
fn no_asset_info() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			// Asset STAKING_ASSET_ID exists but no info is stored for that
			assert_eq!(<AssetMeta<Test>>::get(STAKING_ASSET_ID), AssetInfo::default());
			// Asset STAKING_ASSET_ID doesn't exist
			assert!(!<AssetMeta<Test>>::contains_key(ASSET_ID));
		});
}

#[test]
fn non_owner_not_permitted_update_asset_info() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let web3_asset_info = AssetInfo::new(b"WEB3.0".to_vec(), 3);

			// Should fail as ASSET_ID doesn't exist
			assert_noop!(
				GenericAsset::update_asset_info(Origin::signed(ALICE), ASSET_ID, web3_asset_info.clone()),
				Error::<Test>::AssetIdNotExist
			);

			// Should fail as ALICE hasn't got the permission to update this asset's info
			assert_noop!(
				GenericAsset::update_asset_info(Origin::signed(ALICE), STAKING_ASSET_ID, web3_asset_info,),
				Error::<Test>::NoUpdatePermission
			);
		});
}

#[test]
fn owner_update_asset_info() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let web3_asset_info = AssetInfo::new(b"WEB3.0".to_vec(), 3);

			// Should succeed and set ALICE as the owner of ASSET_ID
			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(PermissionLatest::new(ALICE)),
				web3_asset_info.clone()
			));

			// Should return the same info as ALICE set for the asset while creating it
			assert_eq!(<AssetMeta<Test>>::get(ASSET_ID), web3_asset_info);

			let web3_asset_info = AssetInfo::new(b"WEB3.1".to_vec(), 5);
			// Should succeed as ALICE is the owner of this asset
			assert_ok!(GenericAsset::update_asset_info(
				Origin::signed(ALICE),
				ASSET_ID,
				web3_asset_info.clone(),
			));

			assert_eq!(<AssetMeta<Test>>::get(ASSET_ID), web3_asset_info);
		});
}

#[test]
fn non_owner_permitted_update_asset_info() {
	ExtBuilder::default()
		.free_balance((STAKING_ASSET_ID, ALICE, INITIAL_BALANCE))
		.build()
		.execute_with(|| {
			let web3_asset_info = AssetInfo::new(b"WEB3.0".to_vec(), 3);

			// Should succeed and set ALICE as the owner of ASSET_ID
			assert_ok!(GenericAsset::create(
				Origin::root(),
				ALICE,
				asset_options(PermissionLatest::new(ALICE)),
				web3_asset_info.clone(),
			));

			// Should succeed as ALICE could update the asset info
			assert_eq!(<AssetMeta<Test>>::get(ASSET_ID), web3_asset_info);

			let web3_asset_info = AssetInfo::new(b"WEB3.1".to_vec(), 5);
			// Should fail as BOB hasn't got the permission
			assert_noop!(
				GenericAsset::update_asset_info(Origin::signed(BOB), ASSET_ID, web3_asset_info.clone()),
				Error::<Test>::NoUpdatePermission
			);

			let bob_update_permission = PermissionLatest {
				update: Owner::Address(BOB),
				mint: Owner::None,
				burn: Owner::None,
			};
			assert_ok!(GenericAsset::update_permission(
				Origin::signed(ALICE),
				ASSET_ID,
				bob_update_permission
			));
			// Should succeed as Bob has now got the update permission
			assert_ok!(GenericAsset::update_asset_info(
				Origin::signed(BOB),
				ASSET_ID,
				web3_asset_info.clone()
			));

			// Should succeed as BOB could update the asset info
			assert_eq!(<AssetMeta<Test>>::get(ASSET_ID), web3_asset_info);
		});
}
