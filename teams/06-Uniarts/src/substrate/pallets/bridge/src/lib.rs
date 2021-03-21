#![cfg_attr(not(feature = "std"), no_std)]
/// runtime module implementing Substrate side of PolkadaiBridge token exchange bridge
/// You can use mint to create tokens backed by locked funds on Ethereum side
/// and transfer tokens on substrate side freely
///
/// BUGS:
///     1. Tests can fail with assert_noop! bug: fails through different root hashes
///        solution: use assert_eq!(expr, Err("Error string")) explicitly
///
mod types;

use crate::types::{
    BridgeMessage, BridgeTransfer, Kind, LimitMessage, Limits, MemberId, ProposalId, Status,
    TokenBalance, TransferMessage, ValidatorsMessage,
};
use codec::{Encode};
use sp_core::H160;
use sp_std::prelude::Vec;
use sp_runtime::traits::{Hash, Zero, SaturatedConversion, CheckedDiv, CheckedSub, Saturating};
pub use frame_support::{
    decl_event, decl_module, decl_error, decl_storage, ensure, fail, StorageMap, StorageValue,
    dispatch::DispatchResult,
    traits::{
        Currency, LockableCurrency, ReservableCurrency, ExistenceRequirement, Get, Imbalance, KeyOwnerProofSystem, OnUnbalanced,
        Randomness, WithdrawReason, WithdrawReasons
    },
};
use frame_system::{self as system, ensure_signed};
use pallet_timestamp as timestamp;

const MAX_VALIDATORS: u32 = 100_000;
const DAY_IN_BLOCKS: u32 = 14_400;
const DAY: u32 = 86_400_000;

pub type AccountId<T> = <T as frame_system::Trait>::AccountId;
pub type BalanceOf<T> =
<<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::Balance;

type NegativeImbalanceOf<T> =
<<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::NegativeImbalance;

decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as system::Trait>::AccountId,
        Hash = <T as system::Trait>::Hash,
    {
        RelayMessage(Hash),
        ApprovedRelayMessage(Hash, AccountId, H160, TokenBalance),
        CancellationConfirmedMessage(Hash),
        MintedMessage(Hash),
        BurnedMessage(Hash, AccountId, H160, TokenBalance),
        AccountPausedMessage(Hash, AccountId),
        AccountResumedMessage(Hash, AccountId),
    }
);

// Errors inform users that something went wrong.
decl_error! {
	pub enum Error for Module<T: Trait> {
		/// Tried to deposit with non-supported status
		DepositNonSupported,
		/// Tried to withdraw with non-supported status
		WithdrawNonSupported,
		/// Tried to execute transfer with non-supported status
		TransferNonSupported,
		/// Tried to pause the bridge with non-supported status
		PauseBridgeNonSupported,
		/// Tried to resume the bridge with non-supported status
		ResumeBridgeNonSupported,
		/// Tried to manage bridge with non-supported status
		ManageBridgeNonSupported,
	}
}

pub trait Trait: system::Trait + timestamp::Trait {
    /// The transaction locking balance.
    type Currency: Currency<AccountId<Self>> + ReservableCurrency<Self::AccountId> + LockableCurrency<AccountId<Self>, Moment=Self::BlockNumber> + Send + Sync;

    type Event: From<Event<Self>> + Into<<Self as system::Trait>::Event>;

    /// Handler for the unbalanced decrease when slashing for a rejected proposal or bounty.
    type Slash: OnUnbalanced<NegativeImbalanceOf<Self>>;
}

decl_storage! {
    trait Store for Module<T: Trait> as Bridge {
        pub BridgeIsOperational get(fn bridge_is_operational): bool = true;
        pub BridgeMessages get(fn bridge_messages): map hasher(identity) T::Hash => BridgeMessage<T::AccountId, T::Hash>;

        // limits change history
        pub LimitMessages get(fn limit_messages): map hasher(identity) T::Hash => LimitMessage<T::Hash>;
        pub CurrentLimits get(fn current_limits) build(|config: &GenesisConfig<T>| {
            let mut limits_iter = config.current_limits.clone().into_iter();
            Limits {
                max_tx_value: limits_iter.next().unwrap(),
                day_max_limit: limits_iter.next().unwrap(),
                day_max_limit_for_one_address: limits_iter.next().unwrap(),
                max_pending_tx_limit: limits_iter.next().unwrap(),
                min_tx_value: limits_iter.next().unwrap(),
            }
        }): Limits;

        // open transactions
        pub CurrentPendingBurn get(fn pending_burn_count): u128;
        pub CurrentPendingMint get(fn pending_mint_count): u128;

        pub BridgeTransfers get(fn transfers): map hasher(identity) ProposalId => BridgeTransfer<T::Hash>;
        pub BridgeTransfersCount get(fn bridge_transfers_count): ProposalId;
        pub TransferMessages get(fn messages): map hasher(identity) T::Hash => TransferMessage<T::AccountId, T::Hash>;
        pub TransferId get(fn transfer_id_by_hash): map hasher(identity) T::Hash => ProposalId;
        pub MessageId get(fn message_id_by_transfer_id): map hasher(identity) ProposalId => T::Hash;

        pub DailyHolds get(fn daily_holds): map hasher(identity) T::AccountId => (T::BlockNumber, T::Hash);
        pub DailyLimits get(fn daily_limits_by_account): map hasher(identity) T::AccountId => TokenBalance;
        pub DailyBlocked get(fn daily_blocked): map hasher(identity) T::Moment => Vec<T::AccountId>;

        pub Quorum get(fn quorum): u64 = 2;
        pub ValidatorsCount get(fn validators_count) config(): u32 = 3;
        pub ValidatorVotes get(fn validator_votes): map hasher(identity) (ProposalId, T::AccountId) => bool;
        pub ValidatorHistory get(fn validator_history): map hasher(identity) T::Hash => ValidatorsMessage<T::AccountId, T::Hash>;
        pub Validators get(fn validators) build(|config: &GenesisConfig<T>| {
            config.validator_accounts.clone().into_iter()
            .map(|acc: T::AccountId| (acc, true)).collect::<Vec<_>>()
        }): map hasher(identity) T::AccountId => bool;
        pub ValidatorAccounts get(fn validator_accounts) config(): Vec<T::AccountId>;
    }

    add_extra_genesis{
        config(current_limits): Vec<u128>;
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {
        type Error = Error<T>;

        fn deposit_event() = default;

        // initiate substrate -> ethereum transfer.
        // create proposition and emit the RelayMessage event
        #[weight = 0]
        fn set_transfer(origin, to: H160, #[compact] amount: TokenBalance)-> DispatchResult
        {
            let from = ensure_signed(origin)?;
            ensure!(Self::bridge_is_operational(), "Bridge is not operational");


            Self::check_amount(amount)?;
            Self::check_pending_burn(amount)?;
            Self::check_daily_account_volume(from.clone(), amount)?;

            let transfer_hash = (&from, &to, amount, <timestamp::Module<T>>::get()).using_encoded(<T as system::Trait>::Hashing::hash);

            let message = TransferMessage {
                message_id: transfer_hash,
                eth_address: to,
                substrate_address: from.clone(),
                amount,
                status: Status::Withdraw,
                action: Status::Withdraw,
            };
            Self::get_transfer_id_checked(transfer_hash, Kind::Transfer)?;
            Self::deposit_event(RawEvent::RelayMessage(transfer_hash));

            <DailyLimits<T>>::mutate(from, |a| *a += amount);
            <TransferMessages<T>>::insert(transfer_hash, message);
            Ok(())
        }

        // ethereum-side multi-signed mint operation
        #[weight = 0]
        fn multi_signed_mint(origin, message_id: T::Hash, from: H160, to: T::AccountId, #[compact] amount: TokenBalance)-> DispatchResult {
            let validator = ensure_signed(origin)?;
            ensure!(Self::bridge_is_operational(), "Bridge is not operational");

            Self::check_validator(validator.clone())?;
            Self::check_pending_mint(amount)?;
            Self::check_amount(amount)?;

            if !<TransferMessages<T>>::contains_key(message_id) {
                let message = TransferMessage{
                    message_id,
                    eth_address: from,
                    substrate_address: to,
                    amount,
                    status: Status::Deposit,
                    action: Status::Deposit,
                };
                <TransferMessages<T>>::insert(message_id, message);
                Self::get_transfer_id_checked(message_id, Kind::Transfer)?;
            }

            let transfer_id = <TransferId<T>>::get(message_id);
            Self::_sign(validator, transfer_id)
        }

        // change maximum tx limit
        #[weight = 0]
        fn update_limits(origin, max_tx_value: u128, day_max_limit: u128, day_max_limit_for_one_address: u128, max_pending_tx_limit: u128,min_tx_value: u128)-> DispatchResult {
            let validator = ensure_signed(origin)?;
            Self::check_validator(validator.clone())?;
            let limits = Limits{
                max_tx_value,
                day_max_limit,
                day_max_limit_for_one_address,
                max_pending_tx_limit,
                min_tx_value,
            };
            Self::check_limits(&limits)?;
            let id = (limits.clone(), T::BlockNumber::from(0)).using_encoded(<T as system::Trait>::Hashing::hash);

            if !<LimitMessages<T>>::contains_key(id) {
                let message = LimitMessage {
                    id,
                    limits,
                    status: Status::UpdateLimits,
                };
                <LimitMessages<T>>::insert(id, message);
                Self::get_transfer_id_checked(id, Kind::Limits)?;
            }

            let transfer_id = <TransferId<T>>::get(id);
            Self::_sign(validator, transfer_id)
        }

        // validator`s response to RelayMessage
        #[weight = 0]
        fn approve_transfer(origin, message_id: T::Hash) -> DispatchResult {
            let validator = ensure_signed(origin)?;
            ensure!(Self::bridge_is_operational(), "Bridge is not operational");
            Self::check_validator(validator.clone())?;

            let id = <TransferId<T>>::get(message_id);
            Self::_sign(validator, id)
        }

        // each validator calls it to update whole set of validators
        #[weight = 0]
        fn update_validator_list(origin, message_id: T::Hash, quorum: u64, new_validator_list: Vec<T::AccountId>) -> DispatchResult {
            let validator = ensure_signed(origin)?;
            Self::check_validator(validator.clone())?;

            if !<ValidatorHistory<T>>::contains_key(message_id) {
                let message = ValidatorsMessage {
                    message_id,
                    quorum,
                    accounts: new_validator_list,
                    action: Status::UpdateValidatorSet,
                    status: Status::UpdateValidatorSet,
                };
                <ValidatorHistory<T>>::insert(message_id, message);
                Self::get_transfer_id_checked(message_id, Kind::Validator)?;
            }

            let id = <TransferId<T>>::get(message_id);
            Self::_sign(validator, id)
        }

        // each validator calls it to pause the bridge
        #[weight = 0]
        fn pause_bridge(origin) -> DispatchResult {
            let validator = ensure_signed(origin)?;
            Self::check_validator(validator.clone())?;

            ensure!(Self::bridge_is_operational(), "Bridge is not operational already");
            let hash = ("pause", T::BlockNumber::from(0)).using_encoded(<T as system::Trait>::Hashing::hash);

            if !<BridgeMessages<T>>::contains_key(hash) {
                let message = BridgeMessage {
                    message_id: hash,
                    account: validator.clone(),
                    action: Status::PauseTheBridge,
                    status: Status::PauseTheBridge,
                };
                <BridgeMessages<T>>::insert(hash, message);
                Self::get_transfer_id_checked(hash, Kind::Bridge)?;
            }

            let id = <TransferId<T>>::get(hash);
            Self::_sign(validator, id)
        }

        // each validator calls it to resume the bridge
        #[weight = 0]
        fn resume_bridge(origin) -> DispatchResult {
            let validator = ensure_signed(origin)?;
            Self::check_validator(validator.clone())?;

            let hash = ("resume", T::BlockNumber::from(0)).using_encoded(<T as system::Trait>::Hashing::hash);

            if !<BridgeMessages<T>>::contains_key(hash) {
                let message = BridgeMessage {
                    message_id: hash,
                    account: validator.clone(),
                    action: Status::ResumeTheBridge,
                    status: Status::ResumeTheBridge,
                };
                <BridgeMessages<T>>::insert(hash, message);
                Self::get_transfer_id_checked(hash, Kind::Bridge)?;
            }

            let id = <TransferId<T>>::get(hash);
            Self::_sign(validator, id)
        }

        //confirm burn from validator
        #[weight = 0]
        fn confirm_transfer(origin, message_id: T::Hash) -> DispatchResult {
            let validator = ensure_signed(origin)?;
            ensure!(Self::bridge_is_operational(), "Bridge is not operational");
            Self::check_validator(validator.clone())?;

            let id = <TransferId<T>>::get(message_id);

            let is_approved = <TransferMessages<T>>::get(message_id).status == Status::Approved ||
            <TransferMessages<T>>::get(message_id).status == Status::Confirmed;
            ensure!(is_approved, "This transfer must be approved first.");

            Self::update_status(message_id, Status::Confirmed, Kind::Transfer)?;
            Self::reopen_for_burn_confirmation(message_id)?;
            Self::_sign(validator, id)?;

            Ok(())
        }

        //cancel burn from validator
        #[weight = 0]
        fn cancel_transfer(origin, message_id: T::Hash) -> DispatchResult {
            let validator = ensure_signed(origin)?;
            Self::check_validator(validator.clone())?;

            let has_burned = <TransferMessages<T>>::contains_key(message_id) && <TransferMessages<T>>::get(message_id).status == Status::Confirmed;
            ensure!(!has_burned, "Failed to cancel. This transfer is already executed.");

            let id = <TransferId<T>>::get(message_id);
            Self::update_status(message_id, Status::Canceled, Kind::Transfer)?;
            Self::reopen_for_burn_confirmation(message_id)?;
            Self::_sign(validator, id)?;

            Ok(())
        }

        //close enough to clear it exactly at UTC 00:00 instead of BlockNumber
        fn on_finalize() {
            // clear accounts blocked day earlier (e.g. 18759 - 1)
            let yesterday = Self::get_day_pair().0;
            let is_first_day = Self::get_day_pair().1 == yesterday;
            if <DailyBlocked<T>>::contains_key(&yesterday) && !is_first_day {
                let blocked_yesterday = <DailyBlocked<T>>::get(&yesterday);
                blocked_yesterday.iter().for_each(|a| <DailyLimits<T>>::remove(a));
                blocked_yesterday.iter().for_each(|a|{
                    let hash = (<timestamp::Module<T>>::get(), a.clone()).using_encoded(<T as system::Trait>::Hashing::hash);
                    Self::deposit_event(RawEvent::AccountResumedMessage(hash, a.clone()));
                }
                );
                <DailyBlocked<T>>::remove(&yesterday);
            }
        }
    }
}

impl<T: Trait> Module<T> {
    fn _sign(validator: T::AccountId, transfer_id: ProposalId) -> DispatchResult {
        let mut transfer = <BridgeTransfers<T>>::get(transfer_id);

        let mut message = <TransferMessages<T>>::get(transfer.message_id);
        let mut limit_message = <LimitMessages<T>>::get(transfer.message_id);
        let mut validator_message = <ValidatorHistory<T>>::get(transfer.message_id);
        let mut bridge_message = <BridgeMessages<T>>::get(transfer.message_id);
        let voted = <ValidatorVotes<T>>::get((transfer_id, validator.clone()));
        ensure!(!voted, "This validator has already voted.");
        ensure!(transfer.open, "This transfer is not open");
        transfer.votes += 1;

        if Self::votes_are_enough(transfer.votes) {
            match message.status {
                Status::Confirmed | Status::Canceled => (), // if burn is confirmed or canceled
                _ => match transfer.kind {
                    Kind::Transfer => message.status = Status::Approved,
                    Kind::Limits => limit_message.status = Status::Approved,
                    Kind::Validator => validator_message.status = Status::Approved,
                    Kind::Bridge => bridge_message.status = Status::Approved,
                },
            }
            match transfer.kind {
                Kind::Transfer => Self::execute_transfer(message)?,
                Kind::Limits => Self::_update_limits(limit_message)?,
                Kind::Validator => Self::manage_validator_list(validator_message)?,
                Kind::Bridge => Self::manage_bridge(bridge_message)?,
            }
            transfer.open = false;
        } else {
            match message.status {
                Status::Confirmed | Status::Canceled => (),
                _ => Self::set_pending(transfer_id, transfer.kind.clone())?,
            };
        }

        <ValidatorVotes<T>>::mutate((transfer_id, validator), |a| *a = true);
        <BridgeTransfers<T>>::insert(transfer_id, transfer);

        Ok(())
    }

    /// bridge_lock_id
    fn bridge_lock_id(id: T::Hash) -> [u8; 8] {
        let mut lock_id: [u8; 8] = [0; 8];
        lock_id[0..7].copy_from_slice(id.as_ref());
        lock_id
    }

    ///get (yesterday,today) pair
    fn get_day_pair() -> (T::Moment, T::Moment) {
        let now = <timestamp::Module<T>>::get();
        let day = T::Moment::from(DAY);
        let today = <timestamp::Module<T>>::get().checked_div(&day).expect("time div error");
        let yesterday = if now < day {
            T::Moment::zero()
        } else {
            <timestamp::Module<T>>::get().checked_div(&day).expect("time div error").checked_sub(&T::Moment::from(1)).expect("time sub error")
        };
        (yesterday, today)
    }

    ///ensure that such transfer exist
    fn get_transfer_id_checked(transfer_hash: T::Hash, kind: Kind) -> DispatchResult {
        if !<TransferId<T>>::contains_key(transfer_hash) {
            Self::create_transfer(transfer_hash, kind)?;
        }
        Ok(())
    }

    ///execute actual mint
    fn deposit(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        Self::sub_pending_mint(message.clone())?;
        let to = message.substrate_address;
        if !<DailyHolds<T>>::contains_key(&to) {
            <DailyHolds<T>>::insert(to.clone(), (T::BlockNumber::from(0), message.message_id));
        }
        // Currency mint
        let _ = <T as Trait>::Currency::deposit_into_existing(&to, BalanceOf::<T>::saturated_from(message.amount));

        Self::deposit_event(RawEvent::MintedMessage(message.message_id));
        Self::update_status(message.message_id, Status::Confirmed, Kind::Transfer)
    }

    fn withdraw(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        Self::check_daily_holds(message.clone())?;
        Self::sub_pending_burn(message.clone())?;

        let to = message.eth_address;
        let from = message.substrate_address;
        Self::lock_for_burn(message.message_id,from.clone(), message.amount)?;
        Self::deposit_event(RawEvent::ApprovedRelayMessage(
            message.message_id,
            from,
            to,
            message.amount,
        ));
        Self::update_status(message.message_id, Status::Approved, Kind::Transfer)
    }
    fn _cancel_transfer(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        let lock_id = Self::bridge_lock_id(message.message_id);
        <T as Trait>::Currency::remove_lock(lock_id, &message.substrate_address);
        Self::update_status(message.message_id, Status::Canceled, Kind::Transfer)
    }
    fn pause_the_bridge(message: BridgeMessage<T::AccountId, T::Hash>) -> DispatchResult {
        BridgeIsOperational::mutate(|x| *x = false);
        Self::update_status(message.message_id, Status::Confirmed, Kind::Bridge)
    }

    fn resume_the_bridge(message: BridgeMessage<T::AccountId, T::Hash>) -> DispatchResult {
        BridgeIsOperational::mutate(|x| *x = true);
        Self::update_status(message.message_id, Status::Confirmed, Kind::Bridge)
    }

    fn _update_limits(message: LimitMessage<T::Hash>) -> DispatchResult {
        Self::check_limits(&message.limits)?;
        CurrentLimits::put(message.limits);
        Self::update_status(message.id, Status::Confirmed, Kind::Limits)
    }
    fn add_pending_burn(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        let current = CurrentPendingBurn::get();
        let next = current
            .checked_add(message.amount)
            .ok_or("Overflow adding to new pending burn volume")?;
        CurrentPendingBurn::put(next);
        Ok(())
    }
    fn add_pending_mint(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        let current = CurrentPendingMint::get();
        let next = current
            .checked_add(message.amount)
            .ok_or("Overflow adding to new pending mint volume")?;
        CurrentPendingMint::put(next);
        Ok(())
    }
    fn sub_pending_burn(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        let current = CurrentPendingBurn::get();
        let next = current
            .checked_sub(message.amount)
            .ok_or("Overflow subtracting to new pending burn volume")?;
        CurrentPendingBurn::put(next);
        Ok(())
    }
    fn sub_pending_mint(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        let current = CurrentPendingMint::get();
        let next = current
            .checked_sub(message.amount)
            .ok_or("Overflow subtracting to new pending mint volume")?;
        CurrentPendingMint::put(next);
        Ok(())
    }

    /// update validators list
    fn manage_validator_list(info: ValidatorsMessage<T::AccountId, T::Hash>) -> DispatchResult {
        let new_count = info.accounts.clone().len() as u32;
        ensure!(
            new_count < MAX_VALIDATORS,
            "New validator list is exceeding allowed length."
        );
        Quorum::put(info.quorum);
        ValidatorsCount::put(new_count);
        info.accounts
            .clone()
            .iter()
            .for_each(|v| <Validators<T>>::insert(v, true));
        Self::update_status(info.message_id, Status::Confirmed, Kind::Validator)
    }

    /// check votes validity
    fn votes_are_enough(votes: MemberId) -> bool {
        votes as f64 / f64::from(Self::validators_count()) >= 0.51
    }

    /// lock funds after set_transfer call
    fn lock_for_burn(message_id: T::Hash, account: T::AccountId, amount: TokenBalance) -> DispatchResult {
        // lock currency
        let lock_id = Self::bridge_lock_id(message_id);
        <T as Trait>::Currency::extend_lock(lock_id, &account, BalanceOf::<T>::saturated_from(amount), WithdrawReasons::all());

        Ok(())
    }

    fn execute_burn(message_id: T::Hash) -> DispatchResult {
        let message = <TransferMessages<T>>::get(message_id);
        let from = message.substrate_address.clone();
        let to = message.eth_address;

        // remove lock
        let lock_id = Self::bridge_lock_id(message_id);
        <T as Trait>::Currency::remove_lock(lock_id, &from);
        // burn amount
        let burn_amount = BalanceOf::<T>::saturated_from(message.amount);
        let imbalance = <T as Trait>::Currency::slash_reserved(&from, burn_amount).0;
        <T as Trait>::Slash::on_unbalanced(imbalance);

        <DailyLimits<T>>::mutate(from.clone(), |a| *a -= message.amount);

        Self::deposit_event(RawEvent::BurnedMessage(
            message_id,
            from,
            to,
            message.amount,
        ));
        Ok(())
    }

    fn execute_transfer(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        match message.action {
            Status::Deposit => match message.status {
                Status::Approved => Self::deposit(message),
                Status::Canceled => Self::_cancel_transfer(message),
                _ => Err(Error::<T>::DepositNonSupported.into()),
            },
            Status::Withdraw => match message.status {
                Status::Confirmed => Self::execute_burn(message.message_id),
                Status::Approved => Self::withdraw(message),
                Status::Canceled => Self::_cancel_transfer(message),
                _ => Err(Error::<T>::WithdrawNonSupported.into()),
            },
            _ => Err(Error::<T>::TransferNonSupported.into()),
        }
    }

    fn manage_bridge(message: BridgeMessage<T::AccountId, T::Hash>) -> DispatchResult {
        match message.action {
            Status::PauseTheBridge => match message.status {
                Status::Approved => Self::pause_the_bridge(message),
                _ => Err(Error::<T>::PauseBridgeNonSupported.into()),
            },
            Status::ResumeTheBridge => match message.status {
                Status::Approved => Self::resume_the_bridge(message),
                _ => Err(Error::<T>::ResumeBridgeNonSupported.into()),
            },
            _ => Err(Error::<T>::ManageBridgeNonSupported.into()),
        }
    }

    fn create_transfer(transfer_hash: T::Hash, kind: Kind) -> DispatchResult {
        ensure!(
            !<TransferId<T>>::contains_key(transfer_hash),
            "This transfer already open"
        );

        let transfer_id = BridgeTransfersCount::get();
        let bridge_transfers_count = BridgeTransfersCount::get();
        let new_bridge_transfers_count = bridge_transfers_count
            .checked_add(1)
            .ok_or("Overflow adding a new bridge transfer")?;
        let transfer = BridgeTransfer {
            transfer_id,
            message_id: transfer_hash,
            open: true,
            votes: 0,
            kind,
        };

        <BridgeTransfers<T>>::insert(transfer_id, transfer);
        BridgeTransfersCount::mutate(|count| *count = new_bridge_transfers_count);
        <TransferId<T>>::insert(transfer_hash, transfer_id);
        <MessageId<T>>::insert(transfer_id, transfer_hash);

        Ok(())
    }

    fn set_pending(transfer_id: ProposalId, kind: Kind) -> DispatchResult {
        let message_id = <MessageId<T>>::get(transfer_id);
        match kind {
            Kind::Transfer => {
                let message = <TransferMessages<T>>::get(message_id);
                match message.action {
                    Status::Withdraw => Self::add_pending_burn(message)?,
                    Status::Deposit => Self::add_pending_mint(message)?,
                    _ => (),
                }
            }
            _ => (),
        }
        Self::update_status(message_id, Status::Pending, kind)
    }

    fn update_status(id: T::Hash, status: Status, kind: Kind) -> DispatchResult {
        match kind {
            Kind::Transfer => {
                let mut message = <TransferMessages<T>>::get(id);
                message.status = status;
                <TransferMessages<T>>::insert(id, message);
            }
            Kind::Validator => {
                let mut message = <ValidatorHistory<T>>::get(id);
                message.status = status;
                <ValidatorHistory<T>>::insert(id, message);
            }
            Kind::Bridge => {
                let mut message = <BridgeMessages<T>>::get(id);
                message.status = status;
                <BridgeMessages<T>>::insert(id, message);
            }
            Kind::Limits => {
                let mut message = <LimitMessages<T>>::get(id);
                message.status = status;
                <LimitMessages<T>>::insert(id, message);
            }
        }
        Ok(())
    }

    // needed because @message_id will be the same as initial
    fn reopen_for_burn_confirmation(message_id: T::Hash) -> DispatchResult {
        let message = <TransferMessages<T>>::get(message_id);
        let transfer_id = <TransferId<T>>::get(message_id);
        let mut transfer = <BridgeTransfers<T>>::get(transfer_id);
        let is_eth_response =
            message.status == Status::Confirmed || message.status == Status::Canceled;
        if !transfer.open && is_eth_response {
            transfer.votes = 0;
            transfer.open = true;
            <BridgeTransfers<T>>::insert(transfer_id, transfer);
            let validators = <ValidatorAccounts<T>>::get();
            validators
                .iter()
                .for_each(|a| <ValidatorVotes<T>>::insert((transfer_id, a.clone()), false));
        }
        Ok(())
    }
    fn check_validator(validator: T::AccountId) -> DispatchResult {
        let is_trusted = <Validators<T>>::contains_key(validator);
        ensure!(is_trusted, "Only validators can call this function");

        Ok(())
    }

    fn check_daily_account_volume(account: T::AccountId, amount: TokenBalance) -> DispatchResult {
        let cur_pending = <DailyLimits<T>>::get(&account);
        let cur_pending_account_limit = CurrentLimits::get().day_max_limit_for_one_address;
        let can_burn = cur_pending + amount < cur_pending_account_limit;

        //store current day (like 18768)
        let today = Self::get_day_pair().1;
        let user_blocked = <DailyBlocked<T>>::get(&today).iter().any(|a| *a == account);

        if !can_burn {
            <DailyBlocked<T>>::mutate(today, |v| {
                if !v.contains(&account) {
                    v.push(account.clone());
                    let hash = (<timestamp::Module<T>>::get(), account.clone())
                        .using_encoded(<T as system::Trait>::Hashing::hash);
                    Self::deposit_event(RawEvent::AccountPausedMessage(hash, account))
                }
            });
        }
        ensure!(
            can_burn && !user_blocked,
            "Transfer declined, user blocked due to daily volume limit."
        );

        Ok(())
    }
    fn check_amount(amount: TokenBalance) -> DispatchResult {
        let max = CurrentLimits::get().max_tx_value;
        let min = CurrentLimits::get().min_tx_value;

        ensure!(
            amount > min,
            "Invalid amount for transaction. Reached minimum limit."
        );
        ensure!(
            amount < max,
            "Invalid amount for transaction. Reached maximum limit."
        );
        Ok(())
    }
    //open transactions check
    fn check_pending_burn(amount: TokenBalance) -> DispatchResult {
        let new_pending_volume = CurrentPendingBurn::get()
            .checked_add(amount)
            .ok_or("Overflow adding to new pending burn volume")?;
        let can_burn = new_pending_volume < CurrentLimits::get().max_pending_tx_limit;
        ensure!(can_burn, "Too many pending burn transactions.");
        Ok(())
    }

    fn check_pending_mint(amount: TokenBalance) -> DispatchResult {
        let new_pending_volume = CurrentPendingMint::get()
            .checked_add(amount)
            .ok_or("Overflow adding to new pending mint volume")?;
        let can_burn = new_pending_volume < CurrentLimits::get().max_pending_tx_limit;
        ensure!(can_burn, "Too many pending mint transactions.");
        Ok(())
    }

    fn check_limits(limits: &Limits) -> DispatchResult {
        let max = u128::max_value();
        let min = u128::min_value();
        let passed = limits
            .into_array()
            .iter()
            .fold((true, true), |acc, l| match acc {
                (true, true) => (l < &max, l > &min),
                (true, false) => (l < &max, false),
                (false, true) => (false, l > &min),
                (_, _) => acc,
            });
        ensure!(passed.0, "Overflow setting limit");
        ensure!(passed.1, "Underflow setting limit");
        Ok(())
    }

    fn check_daily_holds(message: TransferMessage<T::AccountId, T::Hash>) -> DispatchResult {
        let from = message.substrate_address;
        let first_tx = <DailyHolds<T>>::get(from.clone());
        let daily_hold = T::BlockNumber::from(DAY_IN_BLOCKS);
        let day_passed = first_tx.0 + daily_hold < T::BlockNumber::from(0);

        if !day_passed {
            let account_balance = <T as Trait>::Currency::free_balance(&from);

            // 75% of potentially really big numbers
            let allowed_amount = account_balance
                .checked_div(&BalanceOf::<T>::saturated_from(100))
                .expect("Failed to calculate allowed withdraw amount")
                .saturating_mul(BalanceOf::<T>::saturated_from(75));

            if BalanceOf::<T>::saturated_from(message.amount) > allowed_amount {
                Self::update_status(message.message_id, Status::Canceled, Kind::Transfer)?;
                fail!("Cannot withdraw more that 75% of first day deposit.");
            }
        }

        Ok(())
    }
}