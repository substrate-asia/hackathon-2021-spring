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

//! Imbalances are an elaborate method of automatically managing total issuance of a currency
//! when they are dropped a hook is triggered to update the currency total issuance accordingly.
//! The may be added and subsracted from each other for efficiencies sake.
//!
//! These should only be created through an instance of `Currency` which will provide the correct asset ID
//!

// wrapping these imbalances in a private module is necessary to ensure absolute
// privacy of the inner member.

use crate::{TotalIssuance, Trait};
use frame_support::{
	storage::StorageMap,
	traits::{Imbalance, TryDrop},
};
use sp_runtime::traits::{Saturating, Zero};
use sp_std::{mem, result};

/// Opaque, move-only struct with private fields that serves as a token
/// denoting that funds have been created without any equal and opposite
/// accounting.
#[must_use]
#[derive(Debug, PartialEq)]
pub struct PositiveImbalance<T: Trait> {
	amount: T::Balance,
	asset_id: T::AssetId,
}

impl<T: Trait> PositiveImbalance<T> {
	/// Create a new positive imbalance from a `balance` and with the given `asset_id`.
	pub fn new(amount: T::Balance, asset_id: T::AssetId) -> Self {
		PositiveImbalance { amount, asset_id }
	}
}

/// Opaque, move-only struct with private fields that serves as a token
/// denoting that funds have been destroyed without any equal and opposite
/// accounting.
#[must_use]
#[derive(Debug, PartialEq)]
pub struct NegativeImbalance<T: Trait> {
	amount: T::Balance,
	asset_id: T::AssetId,
}

impl<T: Trait> NegativeImbalance<T> {
	/// Create a new negative imbalance from a `balance` and with the given `asset_id`.
	pub fn new(amount: T::Balance, asset_id: T::AssetId) -> Self {
		NegativeImbalance { amount, asset_id }
	}
}

impl<T: Trait> TryDrop for PositiveImbalance<T> {
	fn try_drop(self) -> result::Result<(), Self> {
		self.drop_zero()
	}
}

impl<T: Trait> Imbalance<T::Balance> for PositiveImbalance<T> {
	type Opposite = NegativeImbalance<T>;

	fn zero() -> Self {
		Self::new(Zero::zero(), Zero::zero())
	}
	fn drop_zero(self) -> result::Result<(), Self> {
		if self.amount.is_zero() || self.asset_id.is_zero() {
			Ok(())
		} else {
			Err(self)
		}
	}
	fn split(self, amount: T::Balance) -> (Self, Self) {
		let first = self.amount.min(amount);
		let second = self.amount - first;
		let asset_id = self.asset_id;

		mem::forget(self);
		(Self::new(first, asset_id), Self::new(second, asset_id))
	}
	fn merge(mut self, other: Self) -> Self {
		self.amount = self.amount.saturating_add(other.amount);
		mem::forget(other);

		self
	}
	fn subsume(&mut self, other: Self) {
		self.amount = self.amount.saturating_add(other.amount);
		mem::forget(other);
	}
	fn offset(self, other: Self::Opposite) -> result::Result<Self, Self::Opposite> {
		let (a, b) = (self.amount, other.amount);
		let asset_id = self.asset_id;
		mem::forget((self, other));

		if a >= b {
			Ok(Self::new(a - b, asset_id))
		} else {
			Err(NegativeImbalance::new(b - a, asset_id))
		}
	}
	fn peek(&self) -> T::Balance {
		self.amount
	}
}

impl<T: Trait> TryDrop for NegativeImbalance<T> {
	fn try_drop(self) -> result::Result<(), Self> {
		self.drop_zero()
	}
}

impl<T: Trait> Imbalance<T::Balance> for NegativeImbalance<T> {
	type Opposite = PositiveImbalance<T>;

	fn zero() -> Self {
		Self::new(Zero::zero(), Zero::zero())
	}
	fn drop_zero(self) -> result::Result<(), Self> {
		if self.amount.is_zero() || self.asset_id.is_zero() {
			Ok(())
		} else {
			Err(self)
		}
	}
	fn split(self, amount: T::Balance) -> (Self, Self) {
		let first = self.amount.min(amount);
		let second = self.amount - first;
		let asset_id = self.asset_id;

		mem::forget(self);
		(Self::new(first, asset_id), Self::new(second, asset_id))
	}
	fn merge(mut self, other: Self) -> Self {
		self.amount = self.amount.saturating_add(other.amount);
		mem::forget(other);

		self
	}
	fn subsume(&mut self, other: Self) {
		self.amount = self.amount.saturating_add(other.amount);
		mem::forget(other);
	}
	fn offset(self, other: Self::Opposite) -> result::Result<Self, Self::Opposite> {
		let (a, b) = (self.amount, other.amount);
		let asset_id = self.asset_id;
		mem::forget((self, other));

		if a >= b {
			Ok(Self::new(a - b, asset_id))
		} else {
			Err(PositiveImbalance::new(b - a, asset_id))
		}
	}
	fn peek(&self) -> T::Balance {
		self.amount
	}
}

impl<T: Trait> Drop for PositiveImbalance<T> {
	/// Basic drop handler will just square up the total issuance.
	fn drop(&mut self) {
		<TotalIssuance<T>>::mutate(self.asset_id, |v| *v = v.saturating_add(self.amount));
	}
}

impl<T: Trait> Drop for NegativeImbalance<T> {
	/// Basic drop handler will just square up the total issuance.
	fn drop(&mut self) {
		<TotalIssuance<T>>::mutate(self.asset_id, |v| *v = v.saturating_sub(self.amount));
	}
}

/// The result of an offset operation
#[derive(Debug)]
pub enum OffsetResult<T: Trait, I: Imbalance<T::Balance>> {
	Imbalance(I),
	Opposite(I::Opposite),
}

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
	/// The operation cannot occur on imbalances with different asset IDs
	DifferentAssetIds,
	/// The operation cannot occur when asset id is 0 and amount is not 0
	ZeroIdWithNonZeroAmount,
}

/// Provides a safe API around imbalances with asset ID awareness
pub trait CheckedImbalance<T: Trait>: Imbalance<T::Balance> {
	/// Get the imbalance asset ID
	fn asset_id(&self) -> T::AssetId;
	/// Get the imbalance amount
	fn amount(&self) -> T::Balance;
	/// Set the imbalance asset ID
	fn set_asset_id(&mut self, new_asset_id: T::AssetId);
	/// Offset with asset ID safety checks
	fn checked_offset(self, other: Self::Opposite) -> result::Result<OffsetResult<T, Self>, Error>
	where
		Self::Opposite: CheckedImbalance<T>,
	{
		if other.asset_id().is_zero() {
			return Ok(OffsetResult::Imbalance(self))
		}
		if self.asset_id().is_zero() && !self.amount().is_zero() {
			return Err(Error::ZeroIdWithNonZeroAmount);
		}
		if self.asset_id() != other.asset_id() {
			return Err(Error::DifferentAssetIds);
		}
		match self.offset(other) {
			Ok(i) => Ok(OffsetResult::Imbalance(i)),
			Err(i) => Ok(OffsetResult::Opposite(i)),
		}
	}
	/// Subsume with asset ID safety checks
	fn checked_subsume(&mut self, other: Self) -> result::Result<(), Error> {
		if other.asset_id().is_zero() {
			// noop, rhs is 0
			return Ok(());
		}
		if self.asset_id().is_zero() && !self.amount().is_zero() {
			return Err(Error::ZeroIdWithNonZeroAmount);
		}
		if self.asset_id().is_zero() {
			self.set_asset_id(other.asset_id());
		}
		if self.asset_id() != other.asset_id() {
			return Err(Error::DifferentAssetIds);
		}
		Ok(self.subsume(other))
	}
	/// Merge with asset ID safety checks
	fn checked_merge(mut self, other: Self) -> result::Result<Self, Error> {
		if other.asset_id().is_zero() {
			// noop, rhs is 0
			return Ok(self);
		}
		if self.asset_id().is_zero() && !self.amount().is_zero() {
			return Err(Error::ZeroIdWithNonZeroAmount);
		}
		if self.asset_id().is_zero() {
			self.set_asset_id(other.asset_id());
		}
		if self.asset_id() != other.asset_id() {
			return Err(Error::DifferentAssetIds);
		}
		Ok(self.merge(other))
	}
}

impl<T: Trait> CheckedImbalance<T> for PositiveImbalance<T> {
	fn asset_id(&self) -> T::AssetId {
		self.asset_id
	}
	fn amount(&self) -> T::Balance {
		self.amount
	}
	/// Set the imbalance asset ID
	fn set_asset_id(&mut self, new_asset_id: T::AssetId) {
		self.asset_id = new_asset_id;
	}
}

impl<T: Trait> CheckedImbalance<T> for NegativeImbalance<T> {
	fn asset_id(&self) -> T::AssetId {
		self.asset_id
	}
	fn amount(&self) -> T::Balance {
		self.amount
	}
	/// Set the imbalance asset ID
	fn set_asset_id(&mut self, new_asset_id: T::AssetId) {
		self.asset_id = new_asset_id;
	}
}
