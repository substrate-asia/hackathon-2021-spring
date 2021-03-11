
#![cfg_attr(not(feature = "std"), no_std)]

/// A runtime module template with necessary imports

/// Feel free to remove or edit this file as needed.
/// If you change the name of this file, make sure to update its references in runtime/src/lib.rs
/// If you remove this file, you can remove those references


/// For more guidance on Substrate modules, see the example module
/// https://github.com/paritytech/substrate/blob/master/srml/example/src/lib.rs

// use sp_std::prelude::*;

use frame_support::{decl_module, decl_storage, decl_error,
	dispatch::DispatchResult,
	decl_event, Parameter, StorageMap, StorageValue, ensure};
use frame_support::{
	traits::{ Currency},
};
use sp_runtime::{
	traits::{Bounded, Member, Zero, CheckedAdd, CheckedSub},
};
use frame_system::ensure_signed;

use sp_std::vec::Vec;

pub mod linked_item;
use linked_item::{LinkedItem, LinkedList};

pub mod nft_currency;
use nft_currency::{NFTCurrency};


/// The module's configuration trait.
pub trait Config: frame_system::Config {
	// TODO: Add other types and constants required configure this module.

	/// The overarching event type.
	type Event: From<Event<Self>> + Into<<Self as frame_system::Config>::Event>;
	
	//type TokenId: Parameter + Member + SimpleArithmetic + Bounded + Default + Copy;
	type TokenId: From<i32> + Parameter + Member + Bounded + Default + Copy + Into<u64> + CheckedAdd + CheckedSub;

	type Currency: Currency<Self::AccountId>;
}

//type BalanceOf<T> = <<T as Config>::Currency as Currency<<T as system::Config>::AccountId>>::Balance;

type TokenLinkedItem<T> = LinkedItem<<T as Config>::TokenId>;
type OwnerToTokenList<T> = LinkedList<OwnerToToken<T>, <T as frame_system::Config>::AccountId, <T as Config>::TokenId>;

// This module's storage items.
decl_storage! {
	trait Store for Module<T: Config> as Nft {

		//#region ERC-721 metadata extension

		Symbol get(fn symbol) config(): Vec<u8>;

		Name get(fn name) config(): Vec<u8>;

		TokenURI get(fn token_uri): map hasher(blake2_128_concat) T::TokenId => Vec<u8>;

		//#endregion


		//#region ERC-721 compliant contract

		/// TokenId => TokenOwner
		TokenToOwner get(fn owner_of): map hasher(blake2_128_concat) T::TokenId => T::AccountId;

		/// TokenOwner => TokenCount
		OwnerCount get(fn balance_of): map hasher(blake2_128_concat) T::AccountId => T::TokenId;

		/// TokenId =>  Account for Approval
		TokenToApproval get(fn get_approved): map hasher(blake2_128_concat) T::TokenId => Option<T::AccountId>;

		/// (OwnerAccountId, ApprovalAccountId) =>  isApproval
		OwnerToOperator get(fn is_approved_for_all): map hasher(blake2_128_concat) (T::AccountId, T::AccountId) => bool;

		//#endregion


		//#region ERC-721 enumeration extension

		/// total supply of the token
		TotalSupply get(fn total_supply): T::TokenId;

		/// TokenId is token index
		//pub TokenByIndex get(token_by_index): T::TokenId => T::TokenId;

		/// TokenId is token index
		//pub TokenOfOwnerByIndex get(token_of_owner_by_index): map (T::AccountId, T::TokenId) => T::TokenId;

		//#endregion


		//#region Other Index

		/// Owner token linked list, for fast enumeration and transfer
		OwnerToToken get(fn owner_to_token): map hasher(blake2_128_concat) (T::AccountId, Option<T::TokenId>) => Option<TokenLinkedItem<T>>;

		//endregion
	}
}

// The module's dispatchable functions.
decl_module! {
	/// The module declaration.
	pub struct Module<T: Config> for enum Call where origin: T::Origin {
		// Initializing events
		// this is needed only if you are using events in your module
		//fn deposit_event<T>() = default;
		fn deposit_event() = default;

		/// approve another account to manage a token of your account
		#[weight = 10_000]
		fn approve(origin, to:  Option<T::AccountId>, token_id: T::TokenId) {
			let sender = ensure_signed(origin)?;

			<Self as NFTCurrency<_>>::approve(&sender, &to, token_id)?;

			Self::deposit_event(RawEvent::Approval(sender, to, token_id));
		}

		/// approve another account to manage all tokens of your account
		#[weight = 10_000]
		fn set_approval_for_all(origin, to: T::AccountId, approved: bool) {
			let sender = ensure_signed(origin)?;

			<Self as NFTCurrency<_>>::set_approval_for_all(&sender, &to, approved)?;

			Self::deposit_event(RawEvent::ApprovalForAll(sender, to, approved));
		}

		/// transfer token
		#[weight = 10_000]
		fn transfer_from(origin, from: T::AccountId, to: T::AccountId, token_id: T::TokenId) {
			let sender = ensure_signed(origin)?;

			<Self as NFTCurrency<_>>::transfer_from(&sender, &from, &to, token_id)?;

			Self::deposit_event(RawEvent::Transfer(from, to, token_id));
		}

		// safe transfer token
		#[weight = 10_000]
		fn safe_transfer_from(origin, from: T::AccountId, to: T::AccountId, token_id: T::TokenId) {

			let sender = ensure_signed(origin)?;

			<Self as NFTCurrency<_>>::safe_transfer_from(&sender, &from, &to, token_id)?;
			
			Self::deposit_event(RawEvent::Transfer(from, to, token_id));
		}

		#[weight = 10_000]
		fn create_token(origin) {
			let sender = ensure_signed(origin)?;

			Self::do_create_token(&sender)?;
		}
	}
}

decl_error! {
	pub enum Error for Module<T: Config> {
		NoAccess,
		CannotApprove,
		NotOwner,
		// to account balances is zero
		ToBalanceZero, 
	}
}

decl_event!(
	pub enum Event<T> where
		AccountId = <T as frame_system::Config>::AccountId,
		TokenId = <T as Config>::TokenId,
	{
		Approval(AccountId,  Option<AccountId>, TokenId),

		ApprovalForAll(AccountId, AccountId, bool),

		Transfer(AccountId, AccountId, TokenId),
	}
);


impl<T: Config> Module<T> {

	fn do_appove(sender: &T::AccountId, to: &Option<T::AccountId>, token_id: T::TokenId) -> DispatchResult {
		let owner = Self::owner_of(token_id);

		// ensure!(sender == &owner || Self::is_approved_for_all((owner.clone(), sender.clone())), "You do not have access for this token");
		ensure!(sender == &owner || Self::is_approved_for_all((owner.clone(), sender.clone())), Error::<T>::NoAccess);

		if let Some(t) = to {
			// ensure!(&owner != t, "Can not approve to yourself");
			ensure!(&owner != t, Error::<T>::CannotApprove);
			<TokenToApproval<T>>::insert(token_id, t.clone());
		} else {
			<TokenToApproval<T>>::remove(token_id);
		}

		Ok(())
	}

	fn do_appove_for_all(owner: &T::AccountId, to: &T::AccountId, approved: bool) {
		<OwnerToOperator<T>>::insert((owner.clone(), to.clone()), approved);
	}

	fn do_transfer(from: &T::AccountId, to: &T::AccountId, token_id: T::TokenId) -> DispatchResult {
		// update balance
		let from_balance = Self::balance_of(from);
        let to_balance = Self::balance_of(to);
		let new_from_balance = match from_balance.checked_sub(&1.into()) {
            Some (c) => c,
            // None => return Err("from account balance sub error".into()),
            None => return Err("from account balance sub error".into()),
        };
    let new_to_balance = match to_balance.checked_add(&1.into()) {
            Some(c) => c,
            None => return Err("to account balance add error".into()),
        };
        <OwnerCount<T>>::insert(from, new_from_balance);
        <OwnerCount<T>>::insert(to, new_to_balance);

		// token approve remove
		Self::approval_clear(token_id)?;

		// token transfer
		<OwnerToTokenList<T>>::remove(&from, token_id);
		<OwnerToTokenList<T>>::append(&to, token_id);  

		// update token -- owner
		<TokenToOwner<T>>::insert(token_id, to);
		Ok(())
	}

	fn approval_clear(token_id: T::TokenId) -> DispatchResult { 
		<TokenToApproval<T>>::remove(token_id);
        Ok(())
    }

	fn do_create_token(owner: &T::AccountId) -> DispatchResult {
		let token_id = Self::total_supply();
		if token_id == T::TokenId::max_value() {
			return Err("TokenId overflow".into());
		}
		let balance =Self::balance_of(owner);

		<TokenToOwner<T>>::insert(token_id, owner);
		<OwnerCount<T>>::insert(owner, balance + 1.into());
		<TotalSupply<T>>::put(token_id + 1.into());

		<OwnerToTokenList<T>>::append(owner, token_id); 

		Ok(()) 
	}
}

/// impl NFTCurrency Module
impl<T: Config> NFTCurrency<T::AccountId> for Module<T> {

	type TokenId = T::TokenId;

	type Currency= T::Currency;

	fn symbol() -> Vec<u8> {
		Self::symbol()
	}

	fn name() -> Vec<u8> {
		Self::name()
	}

	fn token_uri(token_id: Self::TokenId) -> Vec<u8> {
		Self::token_uri(token_id)
	}

	fn owner_of(token_id: Self::TokenId) -> T::AccountId {
		Self::owner_of(token_id)
	}

	fn balance_of(account: &T::AccountId) -> Self::TokenId {
		Self::balance_of(account)
	}
	
	fn get_approved(token_id: Self::TokenId) -> Option<T::AccountId> {
		Self::get_approved(token_id)
	}

	fn is_approved_for_all(account_approved: (T::AccountId, T::AccountId)) -> bool {
		Self::is_approved_for_all(account_approved)
	}

	fn total_supply() -> Self::TokenId {
		Self::total_supply()
	}

	fn owner_to_token(account_token: (T::AccountId, Option<Self::TokenId>)) -> Option<LinkedItem<Self::TokenId>> {
		Self::owner_to_token(account_token)
	}

	fn approve(
		who: &T::AccountId, 
		to:  &Option<T::AccountId>, 
		token_id: Self::TokenId
	) -> DispatchResult {
		Self::do_appove(who, to, token_id)
	}

	fn set_approval_for_all(
		who: &T::AccountId, 
		to: &T::AccountId, 
		approved: bool
	) -> DispatchResult {
		// ensure!(who != to, "Can not approve to yourself");
		ensure!(who != to, Error::<T>::CannotApprove);
		Self::do_appove_for_all(who, to, approved);
		Ok(())
	}

	// transfer
	fn transfer_from(
		who: &T::AccountId, 
		from: &T::AccountId, 
		to: &T::AccountId, 
		token_id: Self::TokenId
	) -> DispatchResult {
		let token_owner = Self::owner_of(token_id);
		// ensure!(from == &token_owner, "not token owner");
		ensure!(from == &token_owner, Error::<T>::NotOwner);
		let approved_account = Self::get_approved(token_id);
		let is_owner = who == &token_owner;
		let is_approved = approved_account.is_some() && &approved_account.unwrap() == who;
		let is_approved_for_all = Self::is_approved_for_all((from.clone(), who.clone()));
		
		// ensure!(is_owner || is_approved || is_approved_for_all, "You do not own this token auth");
		ensure!(is_owner || is_approved || is_approved_for_all, Error::<T>::NotOwner);

		// do transfer
		Self::do_transfer(&token_owner, to, token_id)
	}

	// safe transfer
	fn safe_transfer_from(
		who: &T::AccountId, 
		from: &T::AccountId, 
		to: &T::AccountId, 
		token_id: Self::TokenId
	) -> DispatchResult {
		let balances = T::Currency::free_balance(&to);
		// ensure!(!balances.is_zero(), "to account balances is zero");
		ensure!(!balances.is_zero(), Error::<T>::ToBalanceZero);
		// transfer

		//the same with transfer_from
		let token_owner = Self::owner_of(token_id);
		// ensure!(from == &token_owner, "not token owner");
		ensure!(from == &token_owner, Error::<T>::NotOwner);
		let approved_account = Self::get_approved(token_id);
		let is_approved_or_owner = who == &token_owner || Some(who.clone()) == approved_account || Self::is_approved_for_all((from.clone(), who.clone()));
		// ensure!(is_approved_or_owner, "You do not own this token auth");
		ensure!(is_approved_or_owner, Error::<T>::NotOwner);

		// do transfer
		Self::do_transfer(&token_owner, to, token_id)
	}
}
