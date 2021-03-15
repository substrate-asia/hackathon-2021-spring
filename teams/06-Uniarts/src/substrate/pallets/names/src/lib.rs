/*
    names - a pallet for Substrate blockchains implementing naming
    Copyright (C) 2020  Autonomous Worlds Ltd

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

#![cfg_attr(not(feature = "std"), no_std)]

//! A pallet that defines a system to register and update names
//! in a Substrate chain.  This provides (roughly) the functionality
//! of the [Namecoin](https://www.namecoin.org/) blockchain.
//!
//! The core concept is that of a *name*.  This is some identifier (the exact
//! type can be configured through the module's [`Trait`](Trait)),
//! e.g. a human-readable name as string.  Each name is unique, and has an
//! associated value and owner.  Everyone can read the database of names, but
//! only the owner can make changes to it.  This typically means changing the
//! value to publish some data with the name, but the owner can also transfer
//! names to a different owner.
//!
//! Names are given out on a *first come, first serve* basis.  Each name that
//! is not yet registered (and valid for the system) can be registered by
//! any account (which may incur a fee for registration, and then maybe also
//! for updates to the name).  Once registered, the name is owned by the
//! account that first registered it.
//!
//! After a certain number of blocks, names may expire and become usable again.
//! By updating a name before the expiration, the current owner can keep
//! ownership.
//!
//! The `names` module defines basic extrinsics to perform name operations
//! ([register](Module::update) / [update](Module::update) /
//! [transfer](Module::transfer) names) and [events](RawEvent) corresponding to
//! changes in the name database.  But if custom logic needs to be applied in
//! addition by the runtime, it may use the exposed functions
//! [`check_assuming_signed`](Module::check_assuming_signed) and
//! [`execute`](Module::execute) directly.  The name database can be accessed
//! from external code by using [`lookup`](Module::lookup).

use frame_support::{
    decl_module, decl_storage, decl_event, ensure,
    weights::{Weight},
    dispatch::DispatchResult, dispatch::fmt::Debug,
    traits::{Currency, ExistenceRequirement, WithdrawReason, WithdrawReasons},
};
use codec::{Decode, Encode, FullCodec};
use frame_system::ensure_signed;

use sp_runtime::traits::CheckedSub;
use core::cmp::max;

/// The pallet's configuration trait.
pub trait Trait: frame_system::Trait {

    /// Type for names.
    type Name: Clone + Debug + Default + Eq + FullCodec;
    /// Type for values associated to names.
    type Value: Clone + Debug + Default + Eq + FullCodec;

    /// Type for currency operations (in order to pay for names).
    type Currency: Currency<Self::AccountId>;

    /// The overarching event type.
    type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

    /// Computes and returns the currency fee the sender has to pay for
    /// a certain operation.  If `None` is returned, it means that the
    /// operation is invalid (e.g. the name is too short).
    fn get_name_fee(op: &Operation<Self>)
        -> Option<<Self::Currency as Currency<Self::AccountId>>::Balance>;

    /// For a given name operation, computes the number of blocks before the
    /// name will expire again.  If `None` is returned, then the name will
    /// never expire.
    fn get_expiration(op: &Operation<Self>) -> Option<Self::BlockNumber>;

    /// "Takes ownership" of the fee paid for a name operation.  This
    /// function can just do nothing to effectively burn the fee, it may
    /// deposit it to a developer account, or it may give it out to miners.
    fn deposit_fee(value: <Self::Currency as Currency<Self::AccountId>>::NegativeImbalance);

}

/// All data stored with a name in the database.
#[cfg_attr(feature = "std", derive(Debug))]
#[derive(Clone, Decode, Encode, Eq, PartialEq)]
pub struct NameData<T: Trait> {
    /// The name's associated value.
    pub value: T::Value,
    /// The name's current owner.
    pub owner: T::AccountId,
    /// The block number when the name expires or `None` if it does not expire.
    pub expiration: Option<T::BlockNumber>,
}

/// Type of a name operation.
#[cfg_attr(feature = "std", derive(Debug))]
#[derive(Eq, PartialEq)]
pub enum OperationType {
    /// This operation registers a name that does not exist yet.
    Registration,
    /// This operation updates an existing name.
    Update,
}

/// All data necessary to actually perform a name operation.
///
/// This is returned by the
/// [validation function](Module::check_assuming_signed), and can then
/// be passed to the [execution function](Module::execute) if a runtime wants
/// to do its own logic in addition.
///
/// A reference to an `Operation` struct is also passed to the [`Trait`](Trait)
/// functions that need to determine e.g. the name fee for the operation.
#[cfg_attr(feature = "std", derive(Debug))]
#[derive(Eq, PartialEq)]
pub struct Operation<T: Trait> {
    /// Type of this operation.
    pub operation: OperationType,
    /// The name being operated on.
    pub name: T::Name,
    /// The value that is being associated to the name.
    pub value: T::Value,

    /// The sender of the name (who pays the name fee).
    sender: T::AccountId,
    /// The owner it is sent to.
    recipient: T::AccountId,

    /// The name fee to pay.
    fee: <T::Currency as Currency<T::AccountId>>::Balance,
}

decl_storage! {
    trait Store for Module<T: Trait> as Names {
        /// The main mapping from names to [associated data](NameData).
        Names get(fn lookup): map hasher(blake2_128_concat) T::Name => Option<NameData<T>>;
        /// All names (as both the second key and the value) that may expire at
        /// the given block height (first key).  We use this so we can
        /// efficiently process expirations whenever we process a new block.
        /// When names are updated, they are not removed from here, though --
        /// so a name's expiration value in the core database overrules this
        /// index.
        Expirations get(fn block_lookup): double_map hasher(blake2_128_concat) T::BlockNumber, hasher(blake2_128_concat) T::Name => T::Name;
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        fn deposit_event() = default;

        #[weight = 0]
        pub fn update(origin, name: T::Name, value: T::Value) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let data = Self::check_assuming_signed(who, name, Some(value), None)?;
            Self::execute(data)?;
            Ok(())
        }

        /// Tries to transfer a name to a given recipient.
        ///
        /// If the name does not exist, it will be registered directly to them
        /// with a [default value](std::default::Default).
        #[weight = 0]
        pub fn transfer(origin, name: T::Name, recipient: T::AccountId) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let data = Self::check_assuming_signed(who, name, None, Some(recipient))?;
            Self::execute(data)?;
            Ok(())
        }

        /// Processes all names logic required before executing extrinsics
        /// of a given block.  In concrete terms, this function makes sure that
        /// names expired in the current block will be removed from the
        /// database.
        fn on_initialize(h: T::BlockNumber) -> Weight {
            let consumed_weight = 0;
            Self::expire_names(h);
            consumed_weight
        }

    }
}

impl<T: Trait> Module<T> {

    /// Returns a withdraw reasons value for the fee payment.
    fn withdraw_reasons() -> WithdrawReasons {
        let mut res = WithdrawReasons::none();
        res.set(WithdrawReason::Fee);
        res
    }

    /// Checks if a name operation is valid, assuming that we already know
    /// it was signed by the given account.
    ///
    /// Value and recipient are optional.  If the value is missing, we use the
    /// existing value or the [default value](std::default::Default) if the
    /// name does not exist yet.  If the recipient is missing, we set it to
    /// the `sender` account.
    ///
    /// This function returns either an error if the operation is not valid,
    /// or the [data](Operation) that should be passed to
    /// [`execute`](Module::execute) later on if the transaction is valid.
    pub fn check_assuming_signed(sender: T::AccountId, name: T::Name,
                                 value: Option<T::Value>,
                                 recipient: Option<T::AccountId>) -> Result<Operation<T>, &'static str> {
        let (typ, old_value) = match <Names<T>>::get(&name) {
            None => (OperationType::Registration, T::Value::default()),
            Some(data) => {
                ensure!(sender == data.owner, "non-owner name update");
                (OperationType::Update, data.value)
            },
        };

        let value = match value {
            None => old_value,
            Some(new_value) => new_value,
        };
        let recipient = match recipient {
            None => sender.clone(),
            Some(new_recipient) => new_recipient,
        };

        let mut op = Operation::<T> {
            operation: typ,
            name: name,
            value: value,
            sender: sender,
            recipient: recipient,
            fee: <T::Currency as Currency<T::AccountId>>::Balance::default(),
        };
        op.fee = match T::get_name_fee(&op) {
            None => return Err("operation violates name policy"),
            Some(f) => f,
        };

        /* Make sure that we can withdraw the name fee from the sender account.
           Note that ensure_can_withdraw does not by itself verify the
           amount against the free balance, but just that the new balance
           satisfies all locks in place.  Thus we have to do that ourselves.  */
        let new_balance = match T::Currency::free_balance(&op.sender).checked_sub(&op.fee) {
            None => return Err("insufficient balance for name fee"),
            Some(b) => b,
        };
        match T::Currency::ensure_can_withdraw(&op.sender, op.fee, Self::withdraw_reasons(), new_balance) {
            Err(_) => return Err("cannot withdraw name fee from sender"),
            Ok(_) => (),
        }

        Ok(op)
    }

    /// Executes the state change (and fires events) for a given
    /// [name operation](Operation).
    ///
    /// This should be called after
    /// [`check_assuming_signed`](Module::check_assuming_signed) (passing its
    /// result), and when potential other checks have been done as well.
    ///
    /// This function may actually fail (return an error) if the fee withdrawal
    /// is not possible.  This can happen if some funds were spent externally
    /// between the call to
    /// [`check_assuming_signed`](Module::check_assuming_signed) and this
    /// function.  If that happens, then `execute` will be a noop.
    pub fn execute(op: Operation<T>) -> DispatchResult {
        /* As the very first step, handle the name fee.  This makes sure
           that if withdrawal fails, it will not cause any other changes.  */
        let imbalance = T::Currency::withdraw(&op.sender, op.fee,
                                              Self::withdraw_reasons(),
                                              ExistenceRequirement::AllowDeath)?;
        T::deposit_fee(imbalance);

        let expiration_blocks = T::get_expiration(&op);
        let expiration_height = match expiration_blocks {
            None => None,
            Some(b) => {
                /* In the strange case that we are told to use zero blocks for
                   expiration, make it at least one.  This ensures that we will
                   actually expire the name in the next block, and not end up
                   with an index entry from the past that will stick around
                   forever.  */
                let b = max(b, T::BlockNumber::from(1));
                Some(frame_system::Module::<T>::block_number() + b)
            },
        };

        let data = NameData::<T> {
            value: op.value,
            owner: op.recipient,
            expiration: expiration_height,
        };

        <Names<T>>::insert(&op.name, &data);
        if let Some(h) = expiration_height {
            <Expirations<T>>::insert(h, &op.name, &op.name);
        }

        match op.operation {
            OperationType::Registration => {
                Self::deposit_event(RawEvent::NameRegistered(op.name.clone()));
            },
            OperationType::Update => (),
        }
        Self::deposit_event(RawEvent::NameUpdated(op.name, data));

        Ok(())
    }

    /// Processes all name expirations for the given block number.
    fn expire_names(h: T::BlockNumber) {
        for nm in <Expirations<T>>::iter_prefix(h) {
            if let Some(data) = <Names<T>>::get(&nm.1) {
                match data.expiration {
                    None => (),
                    Some(expiration_height) => {
                        /* Whenever we store an expiration height in a name,
                           it is guaranteed to be larger than the current
                           block height.  And when the block height increases,
                           we first of all remove all names that expire at
                           that height.  This means that the name's expiration
                           height will always be not less than h.  */
                        assert!(expiration_height >= h);
                        if expiration_height <= h {
                            <Names<T>>::remove(&nm.1);
                            Self::deposit_event(RawEvent::NameExpired(nm.1));
                        }
                    },
                }
            }
        }
        <Expirations<T>>::remove_prefix(h);
    }

}

decl_event!(
    pub enum Event<T> where Name = <T as Trait>::Name, NameData = NameData<T> {
        /// Event when a name is newly created.
        NameRegistered(Name),
        /// Event when a name is updated (or created).
        NameUpdated(Name, NameData),
        /// Event when a name expires and is removed from the database.
        NameExpired(Name),
    }
);

/// Module with unit tests.
#[cfg(test)]
mod tests;
