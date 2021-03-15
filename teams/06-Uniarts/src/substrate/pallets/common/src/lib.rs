// Ensure we're `no_std` when compiling for Wasm.
#![cfg_attr(not(feature = "std"), no_std)]

pub mod currency;
pub mod impls;
pub use impls::*;

use frame_support::{traits::Currency};

pub type NegativeImbalance<T> = <pallet_balances::Module<T> as Currency<<T as frame_system::Trait>::AccountId>>::NegativeImbalance;