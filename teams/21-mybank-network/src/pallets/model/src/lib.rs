#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::upper_case_acronyms)]

use codec::{Decode, Encode, FullCodec, HasCompact};
use frame_support::pallet_prelude::Weight;
use sp_runtime::{
	traits::{AtLeast32BitUnsigned, MaybeSerializeDeserialize},
	DispatchError, DispatchResult, FixedU128, RuntimeDebug,
};
use sp_std::{
	cmp::{Eq, PartialEq},
	fmt::Debug,
	prelude::*,
};

#[cfg(feature = "std")]
use serde::{Deserialize, Serialize};

pub type Price = FixedU128;
pub type ExchangeRate = FixedU128;
pub type Ratio = FixedU128;
pub type Rate = FixedU128;

pub type Balance = u128;
pub type Amount = i128;

pub type AssetPoolId = u8;
pub type CurrencyId = u8;

// TODO
#[derive(Encode, Decode, Eq, PartialEq, Copy, Clone, RuntimeDebug, PartialOrd, Ord)]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[repr(u8)]
pub enum CurrencyType {
	MB = 1,
	DOT = 2,
	BTC = 3,
	ETH = 4,
}

pub trait AssetPool {}

pub trait PriceManager<CurrencyId> {
	fn get_relative_price(base: CurrencyId, quote: CurrencyId) -> Option<Price>;
}

pub trait DEXManager<AccountId, CurrencyId, Balance> {}
