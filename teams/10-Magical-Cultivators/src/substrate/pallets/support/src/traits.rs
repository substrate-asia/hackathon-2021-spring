
//! # Interface
//!
//! ## Overview
//! All Traits
//!
use sp_std::{
	fmt::Debug,
	hash::Hash,
};
use sp_runtime::{
	traits::{ AtLeast32BitUnsigned },
};
use frame_support::{
	dispatch::{result::Result, DispatchError, DispatchResult, DispatchResultWithPostInfo},
	traits::Get,
};
use frame_support::pallet_prelude::*;

use sp_std::vec::Vec;
use super::primitives::{ AssetFeature };


pub trait ManagerAccessor<AccountId>: Sized {
	fn get_owner_id() -> AccountId;
	// Default impls
	/// Can thaw tokens, force transfers and burn tokens from any account.
	fn is_admin(_: &AccountId) -> bool { false }
	/// Can mint tokens.
	fn is_issuer(_: &AccountId) -> bool { false }
	/// Can freeze tokens.
	fn is_freezer(_: &AccountId) -> bool { false }
}
/// default implement for test
impl ManagerAccessor<u64> for () {
	fn get_owner_id() -> u64 {
		0
	}
}

pub trait RandomHash<Hash> {
	fn generate() -> Hash;
}
impl RandomHash<u32> for () {
	fn generate() -> u32 { 0 }
}

pub trait RandomNumber<T> {
	fn generate_by_seed(seed: T) -> T;
	fn generate_in_range(total: T) -> T;
}
impl RandomNumber<u32> for () {
	fn generate_by_seed(_: u32) -> u32 { 0 }
	fn generate_in_range(_: u32) -> u32 { 0 }
}

// some thing with life
pub trait LifeTime<BlockNumber> {
	fn base_age(level: u32) -> BlockNumber;
}
impl LifeTime<u64> for () {
	fn base_age(_: u32) -> u64 { 0 }
}

/// An interface over a set of featured assets.
pub trait FeaturedAssets<AccountId> {
	/// The type used to identify featured assets.
	type AssetId: Parameter + Default + Copy;
	type Amount: Parameter + Default + Copy;
	type Balance: Member + Parameter + AtLeast32BitUnsigned + Default + Copy;

	/// The usage of this type of asset
	fn is_in_using(id: Self::AssetId) -> bool;
	/// The total number of this type of asset that exists (minted - burned).
	fn total_supply(id: Self::AssetId) -> Self::Amount;
	/// The balance of this type of asset owned by an account.
	fn balance(id: Self::AssetId, who: AccountId) -> Self::Balance;
	/// The feature of this type of asset
	fn feature(id: Self::AssetId) -> Option<AssetFeature>;

	/// Mint for the specified user.
	fn mint(
		id: Self::AssetId,
		beneficiary: &AccountId,
		amount: Self::Balance,
	) -> DispatchResultWithPostInfo;

	/// Burn asset.
	fn burn(
		id: Self::AssetId,
		who: &AccountId,
		amount: Self::Balance,
	) -> DispatchResultWithPostInfo;

	/// Transfer asset balance to another account.
	fn transfer(
		id: Self::AssetId,
		origin: &AccountId,
		dest: &AccountId,
		amount: Self::Balance,
	) -> DispatchResultWithPostInfo;
}


/// This trait describes an abstraction over a set of unique assets, also known as non-fungible
/// tokens (NFTs).
///
/// Unique assets have an owner, identified by an account ID, and are defined by a common set of
/// attributes (the asset info type). An asset ID type distinguishes unique assets from one another.
/// Assets may be created (minted), destroyed (burned) or transferred.
///
/// This abstraction is implemented by [pallet_commodities::Module](../struct.Module.html).
///
/// Assets with equivalent attributes (as defined by the AssetInfo type) **must** have an equal ID
/// and assets with different IDs **must not** have equivalent attributes.
pub trait UniqueAssets<AccountId> {
	/// The type used to identify unique assets.
	type AssetId: Encode + Decode + Hash + Eq + PartialEq + Member + Ord;
	/// The attributes that distinguish unique assets.
	type AssetInfo: Encode + Decode + Clone + Debug;
	/// The maximum number of this type of asset that may exist (minted - burned).
	type AssetLimit: Get<u128>;
	/// The maximum number of this type of asset that any single account may own.
	type UserAssetLimit: Get<u64>;

	/// The total number of this type of asset that exists (minted - burned).
	fn total() -> u128;
	/// The total number of this type of asset that has been burned (may overflow).
	fn burned() -> u128;
	/// The total number of this type of asset owned by an account.
	fn total_for_account(account: &AccountId) -> u64;
	/// The set of unique assets owned by an account.
	fn assets_for_account(account: &AccountId) -> Vec<(Self::AssetId, Self::AssetInfo)>;
	/// The ID of the account that owns an asset.
	fn owner_of(asset_id: &Self::AssetId) -> AccountId;

	/// Use the provided asset info to create a new unique asset for the specified user.
	/// This method **must** return an error in the following cases:
	/// - The asset, as identified by the asset info, already exists.
	/// - The specified owner account has already reached the user asset limit.
	/// - The total asset limit has already been reached.
	fn mint(
	  owner_account: &AccountId,
	  asset_info: Self::AssetInfo,
	) -> Result<Self::AssetId, DispatchError>;
	/// Destroy an asset.
	/// This method **must** return an error in the following case:
	/// - The asset with the specified ID does not exist.
	fn burn(asset_id: &Self::AssetId) -> DispatchResult;
	/// Transfer ownership of an asset to another account.
	/// This method **must** return an error in the following cases:
	/// - The asset with the specified ID does not exist.
	/// - The destination account has already reached the user asset limit.
	fn transfer(dest_account: &AccountId, asset_id: &Self::AssetId) -> DispatchResult;
}
