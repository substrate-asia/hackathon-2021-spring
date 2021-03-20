#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::prelude::*;
use sp_runtime::{Percent};
use codec::{HasCompact};
pub use pallet::*;

use mc_support::{
	primitives::{
		FeatureDestinyRank, Formula, FeatureHue,
		// UniqueAssetInfo,
	},
	traits::{
		ManagerAccessor, RandomNumber, FeaturedAssets, UniqueAssets,
	},
};

pub type UniqueHash<T> = <<T as Config>::UniqueAssets as UniqueAssets<<T as frame_system::Config>::AccountId>>::AssetId;
pub type UniqueAssetInfoOf<T> = <<T as Config>::UniqueAssets as UniqueAssets<<T as frame_system::Config>::AccountId>>::AssetInfo;
pub type AssetIdOf<T> = <<T as Config>::FeaturedAssets as FeaturedAssets<<T as frame_system::Config>::AccountId>>::AssetId;
pub type AssetBalance<T> = <<T as Config>::FeaturedAssets as FeaturedAssets<<T as frame_system::Config>::AccountId>>::Balance;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::{
		weights::{DispatchClass, Pays},
		dispatch::DispatchResultWithPostInfo,
		pallet_prelude::*
	};
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

		/// The arithmetic type of formula identifier.
		type FormulaId: Member + Parameter + Default + Copy + HasCompact;

		/// The manager origin.
		type ManagerOrigin: EnsureOrigin<Self::Origin>;

		/// Asset Admin is outer module
		type FormulaManager: ManagerAccessor<Self::AccountId>;

		/// Something that provides randomness in the runtime.
		type RandomNumber: RandomNumber<u32>;

		/// The featured asset module
		type FeaturedAssets: FeaturedAssets<Self::AccountId>;

		/// NFT Assets
		type UniqueAssets: UniqueAssets<Self::AccountId>;
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

	#[pallet::call]
	impl<T:Config> Pallet<T> {
		/// create a formula
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub fn create_formula(
			origin: OriginFor<T>,
			formula: Formula<T::FormulaId, AssetBalance<T>>,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::FormulaManager::is_admin(&origin), Error::<T>::NoPermission);

			let formula_id = formula.id;
			ensure!(!Formulas::<T>::contains_key(&formula_id), Error::<T>::IdExists);

			// create formulas
			Formulas::<T>::insert(&formula_id, formula);

			Self::deposit_event(Event::FormulaCreated(formula_id));
			Ok(().into())
		}

		/// modify a formula
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub fn modify_formula_required_rank(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::FormulaId,
			required_rank: FeatureDestinyRank,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::FormulaManager::is_admin(&origin), Error::<T>::NoPermission);

			Formulas::<T>::try_mutate(id, |maybe| {
				let formula = maybe.as_mut().ok_or(Error::<T>::Unknown)?;

				formula.required_rank = required_rank.clone();

				Self::deposit_event(Event::FormulaRequiredRankModified(id, required_rank));
				Ok(().into())
			})
		}

		/// modify a formula
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub fn modify_formula_required_elements(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::FormulaId,
			minimum_elements: Vec<(FeatureHue, AssetBalance<T>)>,
			maximum_elements: Vec<(FeatureHue, AssetBalance<T>)>,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::FormulaManager::is_admin(&origin), Error::<T>::NoPermission);

			Formulas::<T>::try_mutate(id, |maybe| {
				let formula = maybe.as_mut().ok_or(Error::<T>::Unknown)?;

				// modify in formula
				formula.minimum_elements = minimum_elements;
				formula.maximum_elements = maximum_elements;

				Self::deposit_event(Event::FormulaRequiredElementsModified(id));
				Ok(().into())
			})
		}

		/// modify a formula
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub fn modify_formula_rate_of_success(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::FormulaId,
			rate_of_success: Percent,
		) -> DispatchResultWithPostInfo {
			// T::ManagerOrigin::ensure_origin(origin)?;
			let origin = ensure_signed(origin)?;
			ensure!(T::FormulaManager::is_admin(&origin), Error::<T>::NoPermission);

			Formulas::<T>::try_mutate(id, |maybe| {
				let formula = maybe.as_mut().ok_or(Error::<T>::Unknown)?;

				// modify in formula
				formula.rate_of_success = rate_of_success.clone();

				Self::deposit_event(Event::FormulaRateOfSuccessModified(id, rate_of_success));
				Ok(().into())
			})
		}

		/// execute a formula
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub fn excuete_formula(
			origin: OriginFor<T>,
			#[pallet::compact] id: T::FormulaId,
			use_assets: Vec<(AssetIdOf<T>, AssetBalance<T>)>,
		) -> DispatchResultWithPostInfo {
			let who = ensure_signed(origin)?;

			Formulas::<T>::try_mutate(id, |maybe| {
				let formula = maybe.as_mut().ok_or(Error::<T>::Unknown)?;

				// let mut feature_amounts: Vec<(FeatureHue, AssetBalance<T>)> = Vec::new();
				for (asset_id, amount) in use_assets.iter() {
					ensure!(T::FeaturedAssets::is_in_using(*asset_id), Error::<T>::AssetNotUsed);
					let current_asset_balance = T::FeaturedAssets::balance(*asset_id, who.clone());
					ensure!(current_asset_balance >= *amount, Error::<T>::AssetNotEnough);

					// burn all the assets
					T::FeaturedAssets::burn(*asset_id, &who, *amount)?;

					// calc feature amount
					// let feature = T::FeaturedAssets::feature(*asset_id).unwrap();
					// match feature.elements {
					// 	FeatureElements::One(one) => {
					// 	},
					// 	FeatureElements::Two(one, two) => {
					// 	},
					// 	FeatureElements::Three(one, two, three) => {
					// 	},
					// 	FeatureElements::Four(one, two, three, four) => {
					// 	},
					// };
				}
				// Executed
				Self::deposit_event(Event::FormulaExecuted(id, who.clone()));

				// now
				// let current_block = frame_system::Module::<T>::block_number();

				// FIXME we need better generate algorithm according to feature elements
				let rand_value = T::RandomNumber::generate_in_range(100);
				if formula.rate_of_success > Percent::from_percent(rand_value as u8) {
					// let hash = T::UniqueAssets::mint(&who, UniqueAssetInfo {
					// 	formula_id: id,
					// 	mint_at: current_block,
					// 	name: formula.name.clone(),
					// } as UniqueAssetInfoOf<T>)?;
					// Self::deposit_event(Event::MintUniqueAssetSucceeded(id, who, hash));
				} else {
					Self::deposit_event(Event::MintUniqueAssetFailed(id, who));
				}
				Ok(().into())
			})
		}
	}

	#[pallet::storage]
	#[pallet::getter(fn formulas)]
	/// formula definations
	pub(super) type Formulas<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::FormulaId,
		Formula<T::FormulaId, AssetBalance<T>>
	>;

	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId", T::FormulaId = "FormulaId", UniqueHash<T> = "Hash")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Some formula were created. \[formula_id\]
		FormulaCreated(T::FormulaId),
		/// Some formula were modified. \[formula_id, required_rank\]
		FormulaRequiredRankModified(T::FormulaId, FeatureDestinyRank),
		/// Some formula were modified. \[formula_id\]
		FormulaRequiredElementsModified(T::FormulaId),
		/// Some formula were modified. \[formula_id, percent\]
		FormulaRateOfSuccessModified(T::FormulaId, Percent),
		/// Some formula were executed. \[formula_id, who\]
		FormulaExecuted(T::FormulaId, T::AccountId),
		/// Unique asset were minted. \[formula_id, who, commodity_id\]
		MintUniqueAssetSucceeded(T::FormulaId, T::AccountId, UniqueHash<T>),
		/// Mint asset failed. \[formula_id, who\]
		MintUniqueAssetFailed(T::FormulaId, T::AccountId),
	}

	#[pallet::error]
	pub enum Error<T> {
		NoPermission,
		IdExists,
		Unknown,
		AssetNotUsed,
		AssetNotEnough,
	}
}

// The main implementation block for the module.
impl<T: Config> Pallet<T> {
	// Public immutables
	// TODO
}
