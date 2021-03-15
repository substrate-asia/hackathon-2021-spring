#![cfg_attr(not(feature = "std"), no_std)]

use sp_std::vec::Vec;
use frame_support::{
	decl_module, decl_storage, decl_event, decl_error, dispatch, ensure,
	traits::{ Get, Currency, ExistenceRequirement, WithdrawReasons },
};
use frame_system::{ ensure_signed, ensure_root };

type BalanceOf<T> =
	<<T as Config>::ReserveCurrency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

pub trait Config: frame_system::Config {
	type Event: From<Event<Self>> + Into<<Self as frame_system::Config>::Event>;
	type ReserveCurrency: Currency<Self::AccountId>;
}

decl_storage! {
	trait Store for Module<T: Config> as DonutModule {
	}
}

decl_event!(
	pub enum Event<T> where 
		AccountId = <T as frame_system::Config>::AccountId,
		Balance = BalanceOf<T>,
	{
		/// Emit when user wrap STEEM to Donut, Donut Account/Steem Account/Amount
		DonutIssued(AccountId, Vec<u8>, Balance),
		/// Emit when user wrap Donut back to STEEM, Donut Account/Steem Account/Amount
		DonutBurned(AccountId, Vec<u8>, Balance),
	}
);

decl_error! {
	pub enum Error for Module<T: Config> {
		/// Unknow error
		UnknownError,
		/// Trying to burn Donut more than account balance.
		InsufficientBalance,
		/// Invalid bridge signature.
		BadSignature,
	}
}

decl_module! {
	pub struct Module<T: Config> for enum Call where origin: T::Origin {
		// Errors must be initialized if they are used by the pallet.
		type Error = Error<T>;

		// Events must be initialized if they are used by the pallet.
		fn deposit_event() = default;

		#[weight = 10_000]
		fn sudo_issue_donut(origin, donut_account: T::AccountId, steem_account: Vec<u8>, amount: BalanceOf<T>, sig: Vec<u8>) {
			
			ensure_root(origin)?;

            // TODO: Verify signature of bridge

			// Issue Donut
			let _ = T::ReserveCurrency::deposit_creating(&donut_account, amount);

            // Emit an event that the claim was created.
            Self::deposit_event(RawEvent::DonutIssued(donut_account, steem_account, amount));
		}
		
		#[weight = 10_000]
		fn sudo_burn_donut(origin, donut_account: T::AccountId, steem_account: Vec<u8>, amount: BalanceOf<T>, sig: Vec<u8>) {
			
			ensure_root(origin)?;

			// TODO: Verify signature of bridge
			
			// Check balance
			ensure!(T::ReserveCurrency::free_balance(&donut_account) >= amount, Error::<T>::InsufficientBalance);

			// burn Donut
			let _ = T::ReserveCurrency::withdraw(
				&donut_account,
				amount,
				WithdrawReasons::TRANSFER,
				ExistenceRequirement::AllowDeath,
			)
			.map_err(|_| Error::<T>::UnknownError)?;

            // Emit an event that Dont has been burned
			Self::deposit_event(RawEvent::DonutBurned(donut_account, steem_account, amount));
		}
		
		/// Dispatch that everyone can burn their DONT to redeem STEEM back
		#[weight = 10_000]
		fn burn_donut(origin, steem_account: Vec<u8>, amount: BalanceOf<T>) {
			
			let who = ensure_signed(origin)?;
			
			// Check balance
			ensure!(T::ReserveCurrency::free_balance(&who) >= amount, Error::<T>::InsufficientBalance);

			// burn Donut
			let _ = T::ReserveCurrency::withdraw(
				&who,
				amount,
				WithdrawReasons::TRANSFER,
				ExistenceRequirement::AllowDeath,
			)
			.map_err(|_| Error::<T>::UnknownError)?;

            // Emit an event that Dont has been burned
			Self::deposit_event(RawEvent::DonutBurned(who, steem_account, amount));
        }
	}
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
