use frame_support::traits::{Currency, OnUnbalanced};
use crate::*;

/// Logic for the author to get a portion of fees.
pub struct Author<R>(sp_std::marker::PhantomData<R>);

impl<R> OnUnbalanced<NegativeImbalance<R>> for Author<R>
    where
        R: pallet_balances::Trait + pallet_authorship::Trait,
        <R as frame_system::Trait>::AccountId: From<uniarts_primitives::AccountId>,
        <R as frame_system::Trait>::AccountId: Into<uniarts_primitives::AccountId>,
{
    fn on_nonzero_unbalanced(amount: NegativeImbalance<R>) {
        <pallet_balances::Module<R>>::resolve_creating(&<pallet_authorship::Module<R>>::author(), amount);
    }
}