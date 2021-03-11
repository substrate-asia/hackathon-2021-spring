use sp_std::vec::Vec;
use frame_support::{Parameter,  traits::Currency, dispatch::DispatchResult};
use sp_runtime::traits::{Bounded, Member};

use crate::linked_item::{LinkedItem};

pub trait NFTCurrency<AccountId> {
	type TokenId: Parameter + Member + Bounded + Default + Copy + Into<u64>;

	type Currency: Currency<AccountId>;

	fn symbol() -> Vec<u8>;

	fn name() -> Vec<u8>;

	fn token_uri(token_id: Self::TokenId) -> Vec<u8>;

	fn owner_of(token_id: Self::TokenId) -> AccountId;

	fn balance_of(account: &AccountId) -> Self::TokenId;
	
	fn get_approved(token_id: Self::TokenId) -> Option<AccountId>;

	fn is_approved_for_all(account_approved: (AccountId, AccountId)) -> bool;

	fn total_supply() -> Self::TokenId;


	fn owner_to_token(account_token: (AccountId, Option<Self::TokenId>)) -> Option<LinkedItem<Self::TokenId>>;

	/// approve
	fn approve(
		who: &AccountId, 
		to:  &Option<AccountId>, 
		token_id: Self::TokenId
	) -> DispatchResult;

	/// set_approval_for_all
	fn set_approval_for_all(
		who: &AccountId, 
		to: &AccountId, 
		approved: bool
	) -> DispatchResult;

	/// transfer
	fn transfer_from(
		who: &AccountId, 
		from: &AccountId, 
		to: &AccountId, 
		token_id: Self::TokenId
	) -> DispatchResult;

	/// safe transfer
	fn safe_transfer_from(
		who: &AccountId, 
		from: &AccountId, 
		to: &AccountId, 
		token_id: Self::TokenId
	) -> DispatchResult;
}
