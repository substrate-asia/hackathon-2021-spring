#[allow(unused)]
mod errors;

pub use errors::*;

use ink_env::AccountId;
use ink_storage::traits::{PackedLayout, SpreadLayout};

/// refer to the whitepaper, section 1.1 basic concepts for a formal description of these properties.
#[derive(
    Debug, Default, PartialEq, Eq, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout,
)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct ReserveData {
    // stable liquidity rate at which the user has deposited.
    pub stable_liquidity_rate: u128,
    // stable borrow rate at which the user has borrowed.
    pub stable_borrow_rate: u128,

    pub stoken_address: AccountId,

    pub stable_debt_token_address: AccountId,
}

#[derive(
    Debug, Default, PartialEq, Eq, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout,
)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct UserReserveData {
    pub cumulated_liquidity_interest: u128,
    pub cumulated_stable_borrow_interest: u128,
    pub last_update_timestamp: u64,
    // amount borrowed by the user.
    pub borrow_balance: u128,
}
