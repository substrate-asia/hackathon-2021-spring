#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// https://substrate.dev/docs/en/knowledgebase/runtime/frame
/// debug guide https://substrate.dev/recipes/runtime-printing.html

use frame_support::{
	decl_module, decl_storage, decl_event, decl_error, dispatch, debug, ensure,
	traits::{Currency, EnsureOrigin, ReservableCurrency, OnUnbalanced, Get, ExistenceRequirement::{KeepAlive}},
};
use sp_runtime::{ModuleId, traits::{ Hash, AccountIdConversion}};
use frame_support::codec::{Encode, Decode};
use frame_system::{ensure_signed};
use sp_std::{vec::Vec, convert::{TryInto}};

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[derive(Encode, Decode, Default, Clone, PartialEq)]
pub struct Project<AccountId> {
	pub total_votes: u128,
	pub grants: u128,
	pub support_area: u128,
	pub withdrew: u128,
	pub name: Vec<u8>,
	pub owner: AccountId,
}

#[derive(Encode, Decode, Default, Clone, PartialEq)]
pub struct Round {
	pub ongoing: bool,
	pub support_pool: u128,
	pub pre_tax_support_pool: u128,
	pub total_support_area: u128,
	pub total_tax: u128,
}

type ProjectOf<T> = Project<<T as frame_system::Trait>::AccountId>;
type BalanceOf<T> = <<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::Balance;
type NegativeImbalanceOf<T> = <<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::NegativeImbalance;

/// Configure the pallet by specifying the parameters and types on which it depends.
pub trait Trait: frame_system::Trait {
	// used to generate sovereign account
	// refer: https://github.com/paritytech/substrate/blob/743accbe3256de2fc615adcaa3ab03ebdbbb4dbd/frame/treasury/src/lib.rs#L92
	type ModuleId: Get<ModuleId>;

	/// Origin from which admin must come.
	type AdminOrigin: EnsureOrigin<Self::Origin>;

    // The runtime must supply this pallet with an Event type that satisfies the pallet's requirements.
    type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

	/// The currency trait.
	type Currency: ReservableCurrency<Self::AccountId>;

	/// UnitOfVote, 0.001 Unit token
	type UnitOfVote: Get<u128>;

	/// What to do with slashed funds.
	type Slashed: OnUnbalanced<NegativeImbalanceOf<Self>>;

	/// Number of base unit for each vote
	type NumberOfUnitPerVote: Get<u128>;

	/// The ration of fee based on the number of unit
	type FeeRatioPerVote: Get<u128>;

	/// The minimum length of project name
	type NameMinLength: Get<usize>;

	/// The maximum length of project name
	type NameMaxLength: Get<usize>;

	
}

// The pallet's runtime storage items.
// https://substrate.dev/docs/en/knowledgebase/runtime/storage
decl_storage! {
	// A unique name is used to ensure that the pallet's storage items are isolated.
	// This name may be updated, but each pallet in the runtime must use a unique name.
	trait Store for Module<T: Trait> as QuadraticFunding {
		// Learn more about declaring storage items:
		// https://substrate.dev/docs/en/knowledgebase/runtime/storage#declaring-storage-items
		// Map, each round start with an id => bool 
		Rounds get(fn rounds): map hasher(blake2_128_concat) u32 => Round;
		Projects get(fn projects): double_map hasher(blake2_128_concat) u32, hasher(blake2_128_concat) T::Hash => ProjectOf<T>;
		ProjectVotes: double_map hasher(blake2_128_concat) T::Hash, hasher(blake2_128_concat) T::AccountId => u128;
	}
	add_extra_genesis {
		build(|_config| {
			// Create pallet's internal account
			let _ = T::Currency::make_free_balance_be(
				&<Module<T>>::account_id(),
				T::Currency::minimum_balance(),
			);
		});
	}
}

// Pallets use events to inform users when important changes are made.
// https://substrate.dev/docs/en/knowledgebase/runtime/events
decl_event!(
	pub enum Event<T> where AccountId = <T as frame_system::Trait>::AccountId, Hash =  <T as frame_system::Trait>::Hash, {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [project_hash, who]
		ProjectRegistered(Hash, AccountId),
		/// parameters. [project_hash, balance of cost]
		VoteCost(Hash, u128),
		/// parameters. [project_hash, who, number of ballots]
		VoteSucceed(Hash, AccountId, u128),
		/// parameters. [round_id]
		RoundStarted(u32),
		/// parameters. [round_id]
		RoundEnded(u32),
		/// parameters. [round_id, who, amount]
		DonateSucceed(u32, AccountId, u128),
	}
);

// Errors inform users that something went wrong.
decl_error! {
	pub enum Error for Module<T: Trait> {
		/// Error names should be descriptive.
		NoneValue,
		/// Errors should have helpful documentation associated with them.
		StorageOverflow,
		DuplicateProject,
		ProjectNotExist,
		ProjectNameTooLong,
		ProjectNameTooShort,
		InvalidBallot,
		DonationTooSmall,
		RoundExisted,
		RoundNotExist,
		RoundHasEnded,
		DuplicateRound,
	}
}

// Dispatchable functions allows users to interact with the pallet and invoke state changes.
// These functions materialize as "extrinsics", which are often compared to transactions.
// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		// Errors must be initialized if they are used by the pallet.
		type Error = Error<T>;

		// Events must be initialized if they are used by the pallet.
		fn deposit_event() = default;
		const UnitOfVote: u128 = T::UnitOfVote::get();
		const NumberOfUnitPerVote: u128 = T::NumberOfUnitPerVote::get();
		const FeeRatioPerVote: u128 = T::FeeRatioPerVote::get();
		const NameMinLength: u32 = T::NameMinLength::get() as u32;
		const NameMaxLength: u32 = T::NameMaxLength::get() as u32;

		/// A round gets sponsored, this will transfer from sponsor's account to our internal account with the amount to be sponsored
		#[weight = 10_000 + T::DbWeight::get().reads_writes(1,1)]
		pub fn donate(origin, round_id: u32, #[compact] amount: BalanceOf<T>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(Rounds::contains_key(&round_id), Error::<T>::RoundNotExist);
			let round = Rounds::get(round_id);
			ensure!(true == round.ongoing, Error::<T>::RoundHasEnded);
			// the minimum unit, make sure the donate is greater than this
			let min_unit_number = Self::cal_amount(1u128, false);
			let amount_number = Self::balance_to_u128(amount);
			let fee_number = T::FeeRatioPerVote::get().checked_mul(amount_number / T::NumberOfUnitPerVote::get()).unwrap();
			ensure!(amount_number > min_unit_number, Error::<T>::DonationTooSmall);
			let _ = T::Currency::transfer(&who, &Self::account_id(), amount, KeepAlive);
			// update the round
			Rounds::mutate(round_id, |rnd| {
				let ptsp = rnd.pre_tax_support_pool;
				let sp = rnd.support_pool;
				let tt = rnd.total_tax;
				rnd.pre_tax_support_pool = amount_number.checked_add(ptsp).unwrap();
				rnd.support_pool = (amount_number-fee_number).checked_add(sp).unwrap();
				rnd.total_tax = fee_number.checked_add(tt).unwrap();
			});
			Self::deposit_event(RawEvent::DonateSucceed(round_id, who, Self::balance_to_u128(amount)));
			Ok(())
		}

		/// Create a new round, make sure to use a fresh index, any used index is not allowed, even those ended
		#[weight = 10_000 + T::DbWeight::get().reads_writes(1,1)]
		pub fn start_round(origin, round_id: u32) -> dispatch::DispatchResult {
			// Only amdin can control the round 
			T::AdminOrigin::ensure_origin(origin)?;
			ensure!(!Rounds::contains_key(&round_id), Error::<T>::RoundExisted);
			let round = Round {
				ongoing: true,
				support_pool: 0,
				pre_tax_support_pool: 0,
				total_support_area: 0,
				total_tax: 0
			};
			Rounds::insert(round_id, round);
			Self::deposit_event(RawEvent::RoundStarted(round_id));
			Ok(())
		}

		/// End an `ongoing` round and distribute the funds in sponsor pool, any invalid index or round status will cause errors
		#[weight = 10_000 + T::DbWeight::get().reads_writes(1,1)]
		pub fn end_round(origin, round_id: u32) -> dispatch::DispatchResult {
			// Only amdin can control the round 
			T::AdminOrigin::ensure_origin(origin)?;
			ensure!(Rounds::contains_key(&round_id), Error::<T>::RoundNotExist);
			let mut round = Rounds::get(round_id);
			ensure!(true == round.ongoing, Error::<T>::RoundHasEnded);
			let area = round.total_support_area;
			let pool = round.support_pool;
			for (hash, mut project) in Projects::<T>::iter_prefix(round_id) {
				if area > 0 {
					let total = project.grants;
					project.grants = total.checked_add(
						project.support_area.checked_mul(pool/area).unwrap()
					).unwrap();
				}
				debug::info!("Hash: {:?}, Total votes: {:?}, Grants: {:?}", hash, project.total_votes, project.grants);
				// reckon the final grants
				let _ = T::Currency::transfer(
					&Self::account_id(),
					&project.owner,
					Self::u128_to_balance(project.grants),
					KeepAlive
				);
			}
			round.ongoing = false;
			Rounds::insert(round_id, round);
			Self::deposit_event(RawEvent::RoundEnded(round_id));
			Ok(())
		}

		/// Register a project in an ongoing round, so that it can be voted
		#[weight = 10_000 + T::DbWeight::get().reads_writes(1,1)]
		pub fn register_project(origin, round_id: u32, hash: T::Hash, name: Vec<u8>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(name.len() >= T::NameMinLength::get(), Error::<T>::ProjectNameTooShort);
			ensure!(name.len() <= T::NameMaxLength::get(), Error::<T>::ProjectNameTooLong);
			ensure!(!Projects::<T>::contains_key(&round_id, &hash), Error::<T>::DuplicateProject);
			let project = Project {
				total_votes: 0,
				grants: 0,
				support_area: 0,
				withdrew: 0,
				name: name,
				owner: who.clone(),
			};
			Projects::<T>::insert(round_id, hash, project);
			Self::deposit_event(RawEvent::ProjectRegistered(hash, who));
			Ok(())
		}

		/// Vote to a project, this function will transfer corresponding amount of token per your input ballot
		#[weight = 10_000 + T::DbWeight::get().reads_writes(1,1)]
		pub fn vote(origin, round_id: u32, hash: T::Hash, ballot: u128) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(Projects::<T>::contains_key(&round_id, &hash), Error::<T>::ProjectNotExist);
			ensure!(ballot > 0, Error::<T>::InvalidBallot);
			// check whether this round still ongoing
			ensure!(Rounds::contains_key(&round_id), Error::<T>::RoundNotExist);
			let round = Rounds::get(round_id);
			ensure!(true == round.ongoing, Error::<T>::RoundHasEnded);

			// need to calculate hash of project hash and round_id combination here to avoid conflicts of projects in different rounds
			let vote_hash = T::Hashing::hash_of(&(&hash, &round_id));
			let voted = ProjectVotes::<T>::get(vote_hash, &who);
			let cost = Self::cal_cost(voted, ballot);
			ProjectVotes::<T>::insert(vote_hash, &who, ballot+voted);
			let amount = Self::cal_amount(cost, false);
			let fee = Self::cal_amount(cost, true);
			// transfer first, update last, as transfer will ensure the free balance is enough
			let _ = T::Currency::transfer(&who, &Self::account_id(), Self::u128_to_balance(amount), KeepAlive);

			// update the project and corresponding round
			Projects::<T>::mutate(round_id, hash, |poj| {
				let support_area = ballot.checked_mul(poj.total_votes - voted).unwrap();
				poj.support_area = support_area.checked_add(poj.support_area).unwrap();
				poj.total_votes += ballot;
				poj.grants += amount - fee;
				debug::info!("Total votes: {:?}, Current votes: {:?}, Support Area: {:?},Est cost: {:?}",
				poj.total_votes, voted, support_area, cost);
				Rounds::mutate(round_id, |rnd| {
					let tsa = rnd.total_support_area;
					let tt = rnd.total_tax;
					rnd.total_support_area = support_area.checked_add(tsa).unwrap();
					rnd.total_tax = fee.checked_add(tt).unwrap();
				});
			});
			Self::deposit_event(RawEvent::VoteSucceed(hash, who, ballot));
			Ok(())
		}

		/// Calculate the amount of token to spend per your vote history and ballot
		///
		/// This function should only query project, projectVotes and round once, shall NOT update storage
		#[weight = 10_000 + T::DbWeight::get().reads_writes(1,1)]
		pub fn vote_cost(origin, round_id:u32, hash: T::Hash, ballot: u128) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(Projects::<T>::contains_key(&round_id, &hash), Error::<T>::ProjectNotExist);
			ensure!(ballot > 0, Error::<T>::InvalidBallot);
			// check whether this round still ongoing
			ensure!(Rounds::contains_key(&round_id), Error::<T>::RoundNotExist);
			let round = Rounds::get(round_id);
			ensure!(true == round.ongoing, Error::<T>::RoundHasEnded);
		
			// need to calculate hash of project hash and round_id combination here to avoid conflicts of projects in different rounds
			let vote_hash = T::Hashing::hash_of(&(&hash, &round_id));
			let voted = ProjectVotes::<T>::get(vote_hash, &who);
			let cost = Self::cal_cost(voted, ballot);
			debug::info!("Current balance: {:?}", T::Currency::free_balance(&Self::account_id()));
			Self::deposit_event(RawEvent::VoteCost(hash, cost));
			Ok(())
		}
	}
}

impl<T: Trait> Module<T> {
	// Add public immutables and private mutables.

	/// refer https://github.com/paritytech/substrate/blob/743accbe3256de2fc615adcaa3ab03ebdbbb4dbd/frame/treasury/src/lib.rs#L351
	///
	/// This actually does computation. If you need to keep using it, then make sure you cache the
	/// value and only call this once.
	pub fn account_id() -> T::AccountId {
		T::ModuleId::get().into_account()
	}

	pub fn cal_cost(voted: u128, ballot: u128) -> u128 {
		let mut points = ballot.checked_mul(ballot.checked_add(1).unwrap()).unwrap() / 2; 
		points = points.checked_add(ballot.checked_mul(voted).unwrap()).unwrap();
		return points;
	}

	pub fn cal_amount(amount: u128, is_fee: bool) -> u128 {
		let uov = T::UnitOfVote::get();
		let nup = T::NumberOfUnitPerVote::get();
		let frpv = T::FeeRatioPerVote::get();
		if is_fee { 
			uov.checked_mul(frpv).unwrap().checked_mul(amount).unwrap() 
		} else {
			uov.checked_mul(nup).unwrap().checked_mul(amount).unwrap()
		}
	}

	pub fn u128_to_balance(cost: u128) -> BalanceOf<T> {
		TryInto::<BalanceOf::<T>>::try_into(cost).ok().unwrap()
	}

	pub fn balance_to_u128(balance: BalanceOf<T>) -> u128 {
		TryInto::<u128>::try_into(balance).ok().unwrap()
	}
}