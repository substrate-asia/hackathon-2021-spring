#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::prelude::*;
use sp_runtime::{
	RuntimeDebug, Percent,
	traits::{
		// StaticLookup,
		One,
		// Zero,
		// Saturating, CheckedSub, CheckedAdd,
	},
};
// use frame_support::{
	// ensure,
	// traits::{ Get },
	// dispatch::DispatchError,
// };
use codec::{Encode, Decode};
use mc_support::{
	traits::{ LifeTime, UniqueAssets }
};

pub use pallet::*;

pub type AssetIdOf<T> = <<T as Config>::UniqueAssets as UniqueAssets<<T as frame_system::Config>::AccountId>>::AssetId;

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

		/// LifeTime calclator
		type ActorLifeTime: LifeTime<Self::BlockNumber>;

		/// NFT Assets
		type UniqueAssets: UniqueAssets<Self::AccountId>;
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		// TODO handle dying actors
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// generate an actor of the account
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub fn generate(
			origin: OriginFor<T>,
			name: Vec<u8>,
		) -> DispatchResultWithPostInfo {
			let one = ensure_signed(origin)?;

			ensure!(!Actors::<T>::contains_key(one.clone()), Error::<T>::Alive);

			let current_block = frame_system::Module::<T>::block_number();
			// add actor
			Actors::<T>::insert(one.clone(), ActorInfo {
				name: name,
				equipments: Vec::new(),
				born_at: current_block,
				born_age: One::one(),
				live_until: current_block + T::ActorLifeTime::base_age(1),
				level: 1,
				level_progress: Percent::from_percent(0),
			});

			// Emit event.
			Self::deposit_event(Event::ActorBorn(one));
			Ok(().into())
		}

		/// equip some item to an actor
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub fn equip(
			origin: OriginFor<T>,
			item_id: AssetIdOf<T>,
		) -> DispatchResultWithPostInfo {
			let who = ensure_signed(origin)?;

			Actors::<T>::try_mutate(&who, |maybe_actor| {
				let actor = maybe_actor.as_mut().ok_or(Error::<T>::NotExist)?;

				let item_owner = T::UniqueAssets::owner_of(&item_id);
				ensure!(item_owner == who, Error::<T>::NotOwner);

				match actor.equipments.binary_search(&item_id) {
					Ok(_pos) => {} // should never happen
					Err(pos) => actor.equipments.insert(pos, item_id.clone()),
				};

				Self::deposit_event(Event::ActorEquipItem(who.clone(), item_id));
				Ok(().into())
			})
		}
	}

	#[pallet::storage]
	#[pallet::getter(fn actors)]
	pub type Actors<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		ActorInfo<T::BlockNumber, AssetIdOf<T>>
	>;

	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId", AssetIdOf<T> = "Hash")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// An actor borned
		ActorBorn(T::AccountId),
		/// An actor dead
		ActorDead(T::AccountId),
		/// An actor equip some item
		ActorEquipItem(T::AccountId, AssetIdOf<T>),
	}

	#[pallet::error]
	pub enum Error<T> {
		/// Actor Alive.
		Alive,
		/// Actor does't exist.
		NotExist,
		/// Actor was dead.
		Dead,
		/// Actor doesn't own item
		NotOwner,
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, Default)]
pub struct ActorInfo<BlockNumber, Hash> {
	/// Actor name
	name: Vec<u8>,
	/// NFT hashs
	equipments: Vec<Hash>,
	/// The born time
	born_at: BlockNumber,
	/// The born age
	born_age: BlockNumber,
	/// actor dead time
	live_until: BlockNumber,
	// The rank level
	level: u8,
	/// The progress of actor level
	level_progress: Percent,
}

// The main implementation block for the module.
impl<T: Config> Pallet<T> {
	// Public immutables
	/// whether the actor is alive
	pub fn is_alive(who: &T::AccountId) -> bool {
		Actors::<T>::contains_key(who.clone())
	}
}
