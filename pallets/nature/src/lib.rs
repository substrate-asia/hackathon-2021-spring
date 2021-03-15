#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::{fmt::Debug, prelude::*};
use sp_runtime::{
	RuntimeDebug, ModuleId,
	traits::{
		AccountIdConversion, AtLeast32BitUnsigned, StaticLookup,
		Zero,
		// Saturating, CheckedSub, CheckedAdd,
	},
};
use frame_support::{
	// ensure,
	traits::{
		Get, Randomness, Currency, ReservableCurrency
	},
	// dispatch::DispatchError,
};
use codec::{Encode, Decode};
use mc_support::traits::{
	ManagerAccessor, RandomNumber
};

pub use pallet::*;

type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::{
		dispatch::DispatchResultWithPostInfo,
		pallet_prelude::*,
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

		#[pallet::constant]
		/// The Lottery's module id
		type ModuleId: Get<ModuleId>;

		/// The units in which we record balances.
		type Balance: Member + Parameter + AtLeast32BitUnsigned + Default + Copy;

		/// The currency mechanism.
		type Currency: ReservableCurrency<Self::AccountId>;

		/// Something that provides randomness in the runtime.
		type Randomness: Randomness<Self::Hash>;

		/// The manager origin.
		type ManagerOrigin: EnsureOrigin<Self::Origin>;

		/// Number of time we should try to generate a random number that has no modulo bias.
		/// The larger this number, the more potential computation is used for picking the winner,
		/// but also the more likely that the chosen winner is done fairly.
		type MaxGenerateRandom: Get<u32>;
	}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		// TODO on finalized
	}

	#[pallet::call]
	impl<T:Config> Pallet<T> {
		/// Setup up manager
		///
		/// - `manager`: The manager of nature
		///
		/// Emits `ManagerAdded` event when successful.
		///
		/// Weight: `O(0)`
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn set_manager(
			origin: OriginFor<T>,
			manager: <T::Lookup as StaticLookup>::Source,
		) -> DispatchResultWithPostInfo {
			T::ManagerOrigin::ensure_origin(origin)?;
			let manager = T::Lookup::lookup(manager)?;

			ensure!(!Managers::<T>::contains_key(manager.clone()), Error::<T>::InUse);

			// Update manager.
			Managers::<T>::insert(manager.clone(), ManagerInfo {
				deposit: Zero::zero(),
				is_admin: true,
				is_issuer: true,
				is_freezer: true,
			});

			// Emit event.
			Self::deposit_event(Event::ManagerAdded(manager));
			// Return a successful DispatchResultWithPostInfo
			Ok(().into())
		}

		/// Unset some manager
		///
		/// - `who`: The old manager of nature
		///
		/// Emits `ManagerRemoved` event when successful.
		///
		/// Weight: `O(0)`
		#[pallet::weight((10_000 + T::DbWeight::get().writes(1), DispatchClass::Normal, Pays::No))]
		pub(super) fn unset_manager(
			origin: OriginFor<T>,
			who: <T::Lookup as StaticLookup>::Source,
		) -> DispatchResultWithPostInfo {
			T::ManagerOrigin::ensure_origin(origin)?;
			let one = T::Lookup::lookup(who)?;

			Managers::<T>::try_mutate_exists(one.clone(), |maybe_manager| {
				let info = maybe_manager.take().ok_or(Error::<T>::NotManager)?;

				if !info.deposit.is_zero() {
					T::Currency::unreserve(&one, info.deposit);
				}

				*maybe_manager = None;
				// Emit event.
				Self::deposit_event(Event::ManagerRemoved(one));
				Ok(().into())
			})
		}

	}

	// The pallet's runtime storage items.
	// https://substrate.dev/docs/en/knowledgebase/runtime/storage
	#[pallet::storage]
	#[pallet::getter(fn managers)]
	pub(super) type Managers<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		ManagerInfo<BalanceOf<T>>
	>;

	// Pallets use events to inform users when important changes are made.
	// https://substrate.dev/docs/en/knowledgebase/runtime/events
	#[pallet::event]
	#[pallet::metadata(T::AccountId = "AccountId")]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Manager was added. \[who\]
		ManagerAdded(T::AccountId),
		/// Manager was removed. \[who\]
		ManagerRemoved(T::AccountId),
	}

	#[deprecated(note = "use `Event` instead")]
	pub type RawEvent<T> = Event<T>;


	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// The given account id is unknown.
		Unknown,
		/// The account id is already a manager.
		InUse,
		/// The account id is not a manager.
		NotManager,
	}
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, Default)]
pub struct ManagerInfo<
	Balance: Encode + Decode + Clone + Debug + Eq + PartialEq,
> {
	/// The balance.
	deposit: Balance,
	/// Whether the account is an admin.
	is_admin: bool,
	/// Whether the account is an issuer
	is_issuer: bool,
	/// Whether the account is an freezer
	is_freezer: bool,
}

// The main implementation block for the module.
impl<T: Config> Pallet<T> {
	// Public immutables

	/// The account ID of Nature.
	///
	/// This actually does computation. If you need to keep using it, then make sure you cache the
	/// value and only call this once.
	pub fn account_id() -> T::AccountId {
		T::ModuleId::get().into_account()
	}
}

impl<T: Config> ManagerAccessor<T::AccountId> for Pallet<T> {
	fn get_owner_id() -> T::AccountId {
		Self::account_id()
	}
	/// Can thaw tokens, force transfers and burn tokens from any account.
	fn is_admin(who: &T::AccountId) -> bool {
		Managers::<T>::get(who).map(|x| x.is_admin).unwrap_or(false)
	}
	/// Can mint tokens.
	fn is_issuer(who: &T::AccountId) -> bool {
		Managers::<T>::get(who).map(|x| x.is_issuer).unwrap_or(false)
	}
	/// Can freeze tokens.
	fn is_freezer(who: &T::AccountId) -> bool {
		Managers::<T>::get(who).map(|x| x.is_freezer).unwrap_or(false)
	}
}

impl<T: Config> RandomNumber<u32> for Pallet<T> {
	// Generate a random number from a given seed.
	// Note that there is potential bias introduced by using modulus operator.
	// You should call this function with different seed values until the random
	// number lies within `u32::MAX - u32::MAX % n`.
	fn generate_random(seed: u32) -> u32 {
		let random_seed = T::Randomness::random(&(T::ModuleId::get(), seed).encode());
		let random_number = <u32>::decode(&mut random_seed.as_ref())
			.expect("secure hashes should always be bigger than u32; qed");
		random_number
	}
	fn generate_random_in_range(total: u32) -> u32 {
		let mut random_number = Self::generate_random(0);

		// Best effort attempt to remove bias from modulus operator.
		for i in 1 .. T::MaxGenerateRandom::get() {
			if random_number < u32::MAX - u32::MAX % total {
				break;
			}
			random_number = Self::generate_random(i);
		}
		random_number % total
	}
}
