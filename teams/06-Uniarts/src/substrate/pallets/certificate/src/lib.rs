#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{
	decl_module, 
	decl_storage, 
	decl_event, 
	decl_error, 
	dispatch, 
	ensure, 
	traits::Get,
	Parameter,
};
use frame_system::ensure_signed;

use codec::{Encode, Decode};

// use sp_runtime::traits::{Zero, One, Saturating};
use sp_std::{prelude::*};


/// Configure the pallet by specifying the parameters and types on which it depends.
pub trait Trait: frame_system::Trait {
	/// Because this pallet emits events, it depends on the runtime's definition of an event.
	type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

	type WorkId: Parameter + Default + Copy;
}

#[derive(Debug, Encode, Decode, Default, Clone, PartialEq)]
pub struct Work<Id, AccountId> {
	pub id: Id,
	pub name: u32,
	pub owner: AccountId,
	pub digest: u32,
	pub signers: Vec<AccountId>,
}


// The pallet's runtime storage items.
decl_storage! {
	
	trait Store for Module<T: Trait> as Certificate {
		pub Works get(fn works): map hasher(blake2_128_concat) T::WorkId => Work<T::WorkId, T::AccountId>;
		pub MyWorks get(fn works_of): map hasher(blake2_128_concat) T::AccountId => Vec<T::WorkId>;
	}
}

decl_event!(
	pub enum Event<T> where AccountId = <T as frame_system::Trait>::AccountId {
		Created(u32, AccountId),
	}
);

// Errors inform users that something went wrong.
decl_error! {
	pub enum Error for Module<T: Trait> {
		NoneExistWork,
		NoPermission,
	}
}

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		// Errors must be initialized if they are used by the pallet.
		type Error = Error<T>;


		fn deposit_event() = default;

		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn create(origin, work_id: T::WorkId) -> dispatch::DispatchResult {
			let _who = ensure_signed(origin)?;

			Ok(())
		}

		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn update(origin, work_id: T::WorkId, work: Work<T::WorkId, T::AccountId>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(<Works<T>>::contains_key(work_id), Error::<T>::NoneExistWork);

			let work = Self::works(work_id);
			ensure!(work.owner == who, Error::<T>::NoPermission);
			<Works<T>>::mutate(work_id, |w| *w = work);

			Ok(())
		}

		// transfer ownership of work
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn transfer(origin, work_id: T::WorkId, dest: T::AccountId) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(<Works<T>>::contains_key(work_id), Error::<T>::NoneExistWork);

			let _work = Self::works(work_id);
			<Works<T>>::mutate(work_id, |work| work.owner = dest);
			<MyWorks<T>>::mutate(who, |works| works.retain(|id| *id != work_id));

			Ok(())
		}

		// Sign a work
		#[weight = 10_000 + T::DbWeight::get().writes(1)]
		pub fn sign(origin, work_id: T::WorkId) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(<Works<T>>::contains_key(work_id), Error::<T>::NoneExistWork);
			<Works<T>>::mutate(work_id, |work| work.signers.push(who));

			Ok(())
		}
	}
}
