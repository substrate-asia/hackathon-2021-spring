//! # Unique Assets Implementation: Commodities
//!
//! This pallet exposes capabilities for managing unique assets, also known as
//! non-fungible tokens (NFTs).
//!
//! - [`pallet_commodities::Trait`](./trait.Trait.html)
//! - [`Calls`](./enum.Call.html)
//! - [`Errors`](./enum.Error.html)
//! - [`Events`](./enum.RawEvent.html)
//!
//! ## Overview
//!
//! Assets that share a common metadata structure may be created and distributed
//! by an asset admin. Asset owners may burn assets or transfer their
//! ownership. Configuration parameters are used to limit the total number of a
//! type of asset that may exist as well as the number that any one account may
//! own. Assets are uniquely identified by the hash of the info that defines
//! them, as calculated by the runtime system's hashing algorithm.
//!
//! This pallet implements the [`UniqueAssets`](./nft/trait.UniqueAssets.html)
//! trait in a way that is optimized for assets that are expected to be traded
//! frequently.
//!
//! ### Dispatchable Functions
//!
//! * [`mint`](./enum.Call.html#variant.mint) - Use the provided commodity info
//!   to create a new commodity for the specified user. May only be called by
//!   the commodity admin.
//!
//! * [`burn`](./enum.Call.html#variant.burn) - Destroy a commodity. May only be
//!   called by commodity owner.
//!
//! * [`transfer`](./enum.Call.html#variant.transfer) - Transfer ownership of
//!   a commodity to another account. May only be called by current commodity
//!   owner.

#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode,FullCodec};
use sp_std::{cmp::Eq, fmt::Debug, vec::Vec};
use sp_runtime::{
    traits::{Hash},
    RuntimeDebug, DispatchResult, DispatchError,
};
use frame_support::{
	ensure,
	traits::{Get},
	Hashable,
};
use mc_support::traits::{
	LifeTime, UniqueAssets
};

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::{
		weights::{DispatchClass, Pays},
		dispatch::DispatchResultWithPostInfo,
		pallet_prelude::*
	};
	use frame_system::ensure_signed;
	use frame_system::pallet_prelude::*;
	use super::*;

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	/// The module configuration trait.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// The overarching event type.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
		/// The dispatch origin that is able to mint new instances of this type of commodity.
		type CommodityAdmin: EnsureOrigin<Self::Origin>;
		/// The data type that is used to describe this type of commodity.
		type CommodityInfo: Hashable + Member + Debug + Default + FullCodec + Ord;
		/// The maximum number of this type of commodity that may exist (minted - burned).
		type CommodityLimit: Get<u128>;
		/// The maximum number of this type of commodity that any single account may own.
		type UserCommodityLimit: Get<u64>;
		/// The decay time in block number delta
		type LifeTime: LifeTime<Self::BlockNumber>;
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		// TODO handle dying actors
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
        /// Create a new commodity from the provided commodity info and identify the specified
        /// account as its owner. The ID of the new commodity will be equal to the hash of the info
        /// that defines it, as calculated by the runtime system's hashing algorithm.
        ///
        /// The dispatch origin for this call must be the commodity admin.
        ///
        /// This function will throw an error if it is called with commodity info that describes
        /// an existing (duplicate) commodity, if the maximum number of this type of commodity already
        /// exists or if the specified owner already owns the maximum number of this type of
        /// commodity.
        ///
        /// - `owner_account`: Receiver of the commodity.
        /// - `commodity_info`: The information that defines the commodity.
        #[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
        pub fn mint(
			origin: OriginFor<T>,
			owner_account: T::AccountId,
			commodity_info: T::CommodityInfo
		) -> DispatchResultWithPostInfo {
            T::CommodityAdmin::ensure_origin(origin)?;

			// mint asset
            <Self as UniqueAssets<_>>::mint(&owner_account, commodity_info)?;

            Ok(().into())
        }

        /// Destroy the specified commodity.
        ///
        /// The dispatch origin for this call must be the commodity owner.
        ///
        /// - `commodity_id`: The hash (calculated by the runtime system's hashing algorithm)
        ///   of the info that defines the commodity to destroy.
        #[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
        pub fn burn(
			origin: OriginFor<T>,
			commodity_id: T::Hash,
		) -> DispatchResultWithPostInfo {
            let who = ensure_signed(origin)?;
            ensure!(who == AccountForCommodity::<T>::get(&commodity_id), Error::<T>::NotCommodityOwner);

            <Self as UniqueAssets<_>>::burn(&commodity_id)?;
            Self::deposit_event(Event::Burned(commodity_id.clone()));
            Ok(().into())
        }

        /// Transfer a commodity to a new owner.
        ///
        /// The dispatch origin for this call must be the commodity owner.
        ///
        /// This function will throw an error if the new owner already owns the maximum
        /// number of this type of commodity.
        ///
        /// - `dest_account`: Receiver of the commodity.
        /// - `commodity_id`: The hash (calculated by the runtime system's hashing algorithm)
        ///   of the info that defines the commodity to destroy.
        #[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
        pub fn transfer(
			origin: OriginFor<T>,
			dest_account: T::AccountId,
			commodity_id: T::Hash
		) -> DispatchResultWithPostInfo {
            let who = ensure_signed(origin)?;
            ensure!(who == AccountForCommodity::<T>::get(&commodity_id), Error::<T>::NotCommodityOwner);

            <Self as UniqueAssets<_>>::transfer(&dest_account, &commodity_id)?;

            Self::deposit_event(Event::Transferred(commodity_id.clone(), dest_account.clone()));
            Ok(().into())
        }
        /// add meta for a specific nft
        #[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
        pub fn add_meta(
			origin: OriginFor<T>,
			commodity_id: T::Hash,
			key: Vec<u8>,
			value: bool
		) -> DispatchResultWithPostInfo {
            let who = ensure_signed(origin)?;
            ensure!(who.clone() == AccountForCommodity::<T>::get(&commodity_id), Error::<T>::NotCommodityOwner);
            let mut new_meta = Some(MetaKeyValue { key: key.clone(), value: value.clone() });

            let mut metas = Self::meta_data(commodity_id).into_iter()
            .filter_map(|l| if l.key == key { new_meta.take() } else { Some(l) })
            .collect::<Vec<_>>();

            if let Some(meta) = new_meta {
                metas.push(meta)
            }
            if metas.is_empty() {
                NftMeta::<T>::remove(commodity_id);
            } else {
                NftMeta::<T>::insert(commodity_id, metas);
            }
            Self::deposit_event(Event::MetadataEvent(commodity_id, who));
            Ok(().into())
        }
	}

	#[pallet::storage]
	#[pallet::getter(fn total)]
	/// The total number of this type of commodity that exists (minted - burned).
	pub type Total<T> = StorageValue<_, u128, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn burned)]
	/// The total number of this type of commodity that has been burned (may overflow).
	pub type Burned<T> = StorageValue<_, u128, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn total_for_account)]
	/// The total number of this type of commodity owned by an account.
	pub type TotalForAccount<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		u64,
		ValueQuery
	>;

	#[pallet::storage]
	#[pallet::getter(fn commodities_for_account)]
	/// A mapping from an account to a list of all of the commodities of this type that are owned by it.
	pub type CommoditiesForAccount<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		Vec<Commodity<T>>,
		ValueQuery
	>;

	#[pallet::storage]
	#[pallet::getter(fn account_for_commodity)]
	/// A mapping from a commodity ID to the account that owns it.
	pub type AccountForCommodity<T: Config> = StorageMap<
		_,
		Identity,
		T::Hash,
		T::AccountId,
		ValueQuery
	>;

	#[pallet::storage]
	#[pallet::getter(fn meta_data)]
	/// meta data for current NFT
	pub type NftMeta<T: Config> = StorageMap<
		_,
		Identity,
		T::Hash,
		Vec<MetaKeyValue>,
		ValueQuery
	>;

	#[pallet::storage]
	#[pallet::getter(fn exist_info)]
	/// time of generated and decay
	pub type NftExistInfo<T: Config> = StorageMap<
		_,
		Identity,
		T::Hash,
		ExistInfo<T::BlockNumber>,
		ValueQuery
	>;

	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId", T::Hash = "Hash")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
        /// The commodity has been burned.
        Burned(T::Hash),
        /// The commodity has been minted and distributed to the account.
        Minted(T::Hash, T::AccountId),
        /// Ownership of the commodity has been transferred to the account.
        Transferred(T::Hash, T::AccountId),
        /// change metadata event
        MetadataEvent(T::Hash, T::AccountId),
	}

	#[pallet::error]
	pub enum Error<T> {
        // Thrown when there is an attempt to mint a duplicate commodity.
        CommodityExists,
        // Thrown when there is an attempt to burn or transfer a nonexistent commodity.
        NonexistentCommodity,
        // Thrown when someone who is not the owner of a commodity attempts to transfer or burn it.
        NotCommodityOwner,
        // Thrown when the commodity admin attempts to mint a commodity and the maximum number of this
        // type of commodity already exists.
        TooManyCommodities,
        // Thrown when an attempt is made to mint or transfer a commodity to an account that already
        // owns the maximum number of this type of commodity.
        TooManyCommoditiesForAccount,
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, Default, Ord, PartialOrd)]
pub struct MetaKeyValue {
    key: Vec<u8>,
    value: bool,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, Default)]
pub struct ExistInfo<BlockNumber> {
    generated_at: BlockNumber,
    decayed_at: BlockNumber,
}

/// Associates a commodity with its ID.
pub type Commodity<T> = (<T as frame_system::Config>::Hash, <T as Config>::CommodityInfo);

impl<T: Config> UniqueAssets<T::AccountId> for Pallet<T> {
    type AssetId = T::Hash;
    type AssetInfo = T::CommodityInfo;
    type AssetLimit = T::CommodityLimit;
    type UserAssetLimit = T::UserCommodityLimit;

    fn total() -> u128 {
        Self::total()
    }

    fn burned() -> u128 {
        Self::burned()
    }

    fn total_for_account(account: &T::AccountId) -> u64 {
        Self::total_for_account(account)
    }

    fn assets_for_account(account: &T::AccountId) -> Vec<Commodity<T>> {
        Self::commodities_for_account(account)
    }

    fn owner_of(commodity_id: &T::Hash) -> T::AccountId {
        Self::account_for_commodity(commodity_id)
    }

    fn mint(
        owner_account: &T::AccountId,
        commodity_info: T::CommodityInfo,
    ) -> Result<T::Hash, DispatchError> {
        let commodity_id = T::Hashing::hash_of(&commodity_info);

        ensure!(
            !AccountForCommodity::<T>::contains_key(&commodity_id),
            Error::<T>::CommodityExists
        );

        ensure!(
            Self::total_for_account(owner_account) < Self::UserAssetLimit::get(),
            Error::<T>::TooManyCommoditiesForAccount
        );

        ensure!(
            Self::total() < Self::AssetLimit::get(),
            Error::<T>::TooManyCommodities
        );

        let new_commodity = (commodity_id, commodity_info);

        Total::<T>::mutate(|total| *total += 1);
        TotalForAccount::<T>::mutate(owner_account, |total| *total += 1);
        CommoditiesForAccount::<T>::mutate(owner_account, |commodities| {
            match commodities.binary_search(&new_commodity) {
                Ok(_pos) => {} // should never happen
                Err(pos) => commodities.insert(pos, new_commodity),
            }
        });
        AccountForCommodity::<T>::insert(commodity_id, &owner_account);

		// add exist info
		let current_block = frame_system::Module::<T>::block_number();
		NftExistInfo::<T>::insert(commodity_id, ExistInfo {
			generated_at: current_block,
			decayed_at: current_block + T::LifeTime::base_age(0),
		});

		// deposit event
		Self::deposit_event(Event::Minted(commodity_id.clone(), owner_account.clone()));
		// ok
        Ok(commodity_id)
    }

    fn burn(commodity_id: &T::Hash) -> DispatchResult {
        let owner = Self::owner_of(commodity_id);
        ensure!(
            owner != T::AccountId::default(),
            Error::<T>::NonexistentCommodity
        );

        let burn_commodity = (*commodity_id, T::CommodityInfo::default());

        Total::<T>::mutate(|total| *total -= 1);
        Burned::<T>::mutate(|total| *total += 1);
        TotalForAccount::<T>::mutate(&owner, |total| *total -= 1);
        CommoditiesForAccount::<T>::mutate(owner, |commodities| {
            let pos = commodities
                .binary_search(&burn_commodity)
                .expect("We already checked that we have the correct owner;");
            commodities.remove(pos);
        });
        AccountForCommodity::<T>::remove(&commodity_id);
        // remove meta and exist info
        NftMeta::<T>::remove(&commodity_id);
        NftExistInfo::<T>::remove(&commodity_id);

        Ok(())
    }

    fn transfer(
        dest_account: &T::AccountId,
        commodity_id: &T::Hash,
    ) -> DispatchResult {
        let owner = Self::owner_of(&commodity_id);
        ensure!(
            owner != T::AccountId::default(),
            Error::<T>::NonexistentCommodity
        );

        ensure!(
            Self::total_for_account(dest_account) < Self::UserAssetLimit::get(),
            Error::<T>::TooManyCommoditiesForAccount
        );

        let xfer_commodity = (*commodity_id, <T>::CommodityInfo::default());

        TotalForAccount::<T>::mutate(&owner, |total| *total -= 1);
        TotalForAccount::<T>::mutate(dest_account, |total| *total += 1);
        let commodity = CommoditiesForAccount::<T>::mutate(owner, |commodities| {
            let pos = commodities
                .binary_search(&xfer_commodity)
                .expect("We already checked that we have the correct owner; qed");
            commodities.remove(pos)
        });
        CommoditiesForAccount::<T>::mutate(dest_account, |commodities| {
            match commodities.binary_search(&commodity) {
                Ok(_pos) => {} // should never happen
                Err(pos) => commodities.insert(pos, commodity),
            }
        });
        AccountForCommodity::<T>::insert(&commodity_id, &dest_account);

        Ok(())
    }
}
