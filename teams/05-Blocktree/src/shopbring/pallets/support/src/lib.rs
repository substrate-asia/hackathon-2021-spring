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

#![cfg_attr(not(feature = "std"), no_std)]

//! # Common types and traits

// Note: in the following traits the terms:
// - 'token' / 'asset' / 'currency' and
// - 'balance' / 'value' / 'amount'
// are used interchangeably as they make more sense in certain contexts.
use codec::{Codec, FullCodec};
use frame_support::traits::{ExistenceRequirement, Imbalance, SignedImbalance, WithdrawReasons};
use sp_runtime::{
	traits::{AtLeast32BitUnsigned, MaybeSerializeDeserialize, Saturating, Zero},
	DispatchError, DispatchResult,
};
use sp_std::{fmt::Debug, result};

/// Something which provides an ID with authority from chain storage
pub trait AssetIdAuthority {
	/// The asset ID type e.g a `u32`
	type AssetId;
	/// Return the authoritative asset ID (no `&self`)
	fn asset_id() -> Self::AssetId;
}

/// An abstraction over the accounting behaviour of a fungible, multi-currency system
/// Currencies in the system are identifiable by a unique `CurrencyId`
pub trait MultiCurrencyAccounting {
	/// The ID type for an account in the system
	type AccountId: Codec + Debug + Default;
	/// The balance of an account for a particular currency
	type Balance: AtLeast32BitUnsigned + FullCodec + Copy + MaybeSerializeDeserialize + Debug + Default + Saturating;
	/// The ID type of a currency in the system
	type CurrencyId: Codec + Debug + Default;
	/// A type the is aware of the default network currency ID
	/// When the currency ID is not specified for a `MultiCurrencyAccounting` method, it will be used
	/// by default
	type DefaultCurrencyId: AssetIdAuthority<AssetId = Self::CurrencyId>;
	/// The opaque token type for an imbalance of a particular currency. This is returned by unbalanced operations
	/// and must be dealt with. It may be dropped but cannot be cloned.
	type NegativeImbalance: Imbalance<Self::Balance, Opposite = Self::PositiveImbalance>;
	/// The opaque token type for an imbalance of a particular currency. This is returned by unbalanced operations
	/// and must be dealt with. It may be dropped but cannot be cloned.
	type PositiveImbalance: Imbalance<Self::Balance, Opposite = Self::NegativeImbalance>;

	// PUBLIC IMMUTABLES

	/// The minimum balance any single account may have. This is equivalent to the `Balances` module's
	/// `ExistentialDeposit`.
	fn minimum_balance() -> Self::Balance {
		Zero::zero()
	}

	/// The combined balance (free + reserved) of `who` for the given `currency`.
	fn total_balance(who: &Self::AccountId, currency: Option<Self::CurrencyId>) -> Self::Balance;

	/// The 'free' balance of a given account.
	///
	/// This is the only balance that matters in terms of most operations on tokens. It alone
	/// is used to determine the balance when in the contract execution environment. When this
	/// balance falls below the value of `ExistentialDeposit`, then the 'current account' is
	/// deleted: specifically `FreeBalance`. Further, the `OnFreeBalanceZero` callback
	/// is invoked, giving a chance to external modules to clean up data associated with
	/// the deleted account.
	///
	/// `system::AccountNonce` is also deleted if `ReservedBalance` is also zero (it also gets
	/// collapsed to zero if it ever becomes less than `ExistentialDeposit`.
	fn free_balance(who: &Self::AccountId, currency: Option<Self::CurrencyId>) -> Self::Balance;

	/// Returns `Ok` iff the account is able to make a withdrawal of the given amount
	/// for the given reason. Basically, it's just a dry-run of `withdraw`.
	///
	/// `Err(...)` with the reason why not otherwise.
	fn ensure_can_withdraw(
		who: &Self::AccountId,
		currency: Option<Self::CurrencyId>,
		_amount: Self::Balance,
		reasons: WithdrawReasons,
		new_balance: Self::Balance,
	) -> DispatchResult;

	// PUBLIC MUTABLES (DANGEROUS)

	/// Adds up to `value` to the free balance of `who`. If `who` doesn't exist, it is created.
	///
	/// Infallible.
	fn deposit_creating(
		who: &Self::AccountId,
		currency: Option<Self::CurrencyId>,
		value: Self::Balance,
	) -> Self::PositiveImbalance;

	/// Mints `value` to the free balance of `who`.
	///
	/// If `who` doesn't exist, nothing is done and an Err returned.
	fn deposit_into_existing(
		who: &Self::AccountId,
		currency: Option<Self::CurrencyId>,
		value: Self::Balance,
	) -> result::Result<Self::PositiveImbalance, DispatchError>;

	/// Ensure an account's free balance equals some value; this will create the account
	/// if needed.
	///
	/// Returns a signed imbalance and status to indicate if the account was successfully updated or update
	/// has led to killing of the account.
	fn make_free_balance_be(
		who: &Self::AccountId,
		currency: Option<Self::CurrencyId>,
		balance: Self::Balance,
	) -> SignedImbalance<Self::Balance, Self::PositiveImbalance>;

	/// Transfer some liquid free balance to another staker.
	///
	/// This is a very high-level function. It will ensure all appropriate fees are paid
	/// and no imbalance in the system remains.
	fn transfer(
		source: &Self::AccountId,
		dest: &Self::AccountId,
		currency: Option<Self::CurrencyId>,
		value: Self::Balance,
		existence_requirement: ExistenceRequirement,
	) -> DispatchResult;

	/// Removes some free balance from `who` account for `reason` if possible. If `liveness` is
	/// `KeepAlive`, then no less than `ExistentialDeposit` must be left remaining.
	///
	/// This checks any locks, vesting, and liquidity requirements. If the removal is not possible,
	/// then it returns `Err`.
	///
	/// If the operation is successful, this will return `Ok` with a `NegativeImbalance` whose value
	/// is `value`.
	fn withdraw(
		who: &Self::AccountId,
		currency: Option<Self::CurrencyId>,
		value: Self::Balance,
		reasons: WithdrawReasons,
		liveness: ExistenceRequirement,
	) -> result::Result<Self::NegativeImbalance, DispatchError>;
}
