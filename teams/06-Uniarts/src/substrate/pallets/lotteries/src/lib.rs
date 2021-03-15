#![cfg_attr(not(feature = "std"), no_std)]
use codec::{Encode, Decode};
use sp_runtime::sp_std::{
    prelude::*,
    vec::Vec,
    result,
    collections::btree_map::BTreeMap,
};
use frame_support::{
    Parameter, decl_module, decl_event, decl_storage, decl_error, ensure,
    weights::{Weight, GetDispatchInfo, Pays},
    traits::{
        Currency, EnsureOrigin, Get, Randomness, UnfilteredDispatchable,
        OnUnbalanced, ExistenceRequirement,
    },
    dispatch::DispatchResultWithPostInfo,
};
use sp_runtime::{
    RuntimeDebug, ModuleId, DispatchResult, DispatchError,
    traits::{Zero, CheckedDiv, AccountIdConversion, SimpleBitOps, Scale},
};
use frame_system::ensure_signed;

/// A reason index, e.g. the referendum index in democracy
type ReasonIndex = u32;

/// A lottery index
pub type LottoIndex = u32;

#[derive(Encode, Decode, Copy, Clone, Eq, PartialEq, RuntimeDebug)]
enum LotteryKind {
    /// Common lottery
    Routine,
    /// Funded by treasury with the reason represented by hash
    TreasuryFunded(ReasonIndex)
}

impl Default for LotteryKind {
    fn default() -> Self { LotteryKind::Routine }
}

#[derive(Encode, Decode, Copy, Clone, Eq, PartialEq, RuntimeDebug)]
pub enum LottoResult<AccountId, Balance> {
    Routine(AccountId, Balance),
    TreasuryFunded(Balance)
}

#[derive(Encode, Decode, Clone, Default, Eq, PartialEq, RuntimeDebug)]
pub struct Lottery<AccountId: Ord, Balance: Ord> {
    round: LottoIndex,
    /// Kind of the lottery
    kind: LotteryKind,
    /// Total amount in the current lottery pool that could be paid out
    jackpot: Balance,
    next_ticket_id: u32,
    /// player_account => has_claimed_the_reward_or_not
    players: BTreeMap<AccountId, bool>,
    tickets: BTreeMap<u32, AccountId>,
    result: Option<LottoResult<AccountId, Balance>>,
}


impl<AccountId: Ord + Default,
    Balance: Ord + Default> Lottery<AccountId, Balance> {
    fn new(round: LottoIndex, kind: LotteryKind) -> Self {
        Lottery {round, kind, ..Default::default()}
    }

    /// Transform the lottery kind from `Routine` to `TreasuryFunded`
    /// before the lottery ended
    fn convert_kind(&mut self, reason: ReasonIndex) {
        if let LotteryKind::Routine = self.kind {
            if !self.has_ended() {
                self.kind = LotteryKind::TreasuryFunded(reason)
            }
        }
    }

    /// A lottery has ended if it has a result in it
    fn has_ended(&self) -> bool {
        self.result.is_some()
    }

    /// Is the player already a participant in the current lottery
    fn is_player(&self, who: &AccountId) -> bool {
        self.players.get(who).is_some()
    }

    /// If one is winner or not
    fn is_winner(&self, who: &AccountId) -> bool {
        match &self.result {
            Some(LottoResult::Routine(account, _)) => who == account,
            Some(LottoResult::TreasuryFunded(_)) => true,
            None => false

        }
    }

    fn draw(&mut self, result: LottoResult<AccountId, Balance>) {
        self.result = Some(result)
    }

    /// Check if one can claim the lottery reward
    fn able_to_claim(&self, who: &AccountId) -> bool {
        // if one has participated the lottery and
        // has not claimed the reward
        self.players.get(who).map_or(false, |b| !b) &&
            self.is_winner(who)
    }

    fn claim(&mut self, who: &AccountId) {
        if let Some(x) = self.players.get_mut(who) {
            *x = true;
        }
    }



}

type BalanceOf<T> = <<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::Balance;
type PositiveImbalanceOf<T> = <<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::PositiveImbalance;

pub trait Trait: frame_system::Trait {
    /// The overarching event type.
    type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

    /// A dispatchable call.
    type Call: Parameter + UnfilteredDispatchable<Origin=Self::Origin> + GetDispatchInfo;

    /// The lotteries's Module Id
    type ModuleId: Get<ModuleId>;

    /// The currency used for lottery draw
    type Currency: Currency<Self::AccountId>;

    /// Origin from which may evoke the lottery pay-out.
    type LotteryDrawOrigin: EnsureOrigin<Self::Origin>;

    /// the minimum amount used to buy a lottery ticket
    type TicketPrice: Get<BalanceOf<Self>>;

    /// Period in blocks where a lottery is about to draw
    type LuckyPeriod: Get<Self::BlockNumber>;

    /// Something that provides a random number for the lottery draw
    type Randomness: Randomness<Self::Hash>;
}

decl_event!(
	pub enum Event<T> where
		AccountId = <T as frame_system::Trait>::AccountId,
		Balance = BalanceOf<T>,
	{
		/// A new lottery created. [current_lottery_index]
		NewRound(LottoIndex),
		/// Participate the current lottery. [participant, current_lottery_index]
		BuyTicket(AccountId, LottoIndex),
		/// Draw a routine lottery. [current_lottery_id, winner_account]
		RoutineLottoDraw(LottoIndex, AccountId),
		/// Draw a reasury-funded lottery [current_lottery_id, individual_reward]
		FundedLottoDraw(LottoIndex, Balance),
		/// Claim reward from a lottery. [current_lottery_id, claimer, individual_reward]
		RewardClaimed(LottoIndex, AccountId, Balance),
	}
);

decl_error! {
	pub enum Error for Module<T: Trait> {
		/// Lottery have not ended
		NotEnded,
		/// Current lottery has already ended
		AlreadyEnded,
		/// The lottery is not initialized
		NotExists,
		/// The lottery about to create has already existed
		AlreadyExisted,
		/// A user can only participate once in a lottery round
		OnlyOnce,
		/// Fail to claim a reward
		ClaimFailed,

	}
}

decl_storage! {
	trait Store for Module<T: Trait> as Lotteries {
		/// The index for a new created lottery
		pub NextLotteryIndex get(fn next_lottery_index): LottoIndex = 0;

		/// Lottery details
		pub LotteryInfo get(fn lottery_info):
			map hasher(twox_64_concat) LottoIndex => Option<Lottery<T::AccountId, BalanceOf<T>>>;
	}
}


decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {

		// Errors must be initialized if they are used by the pallet.
		type Error = Error<T>;

		const TicketPrice: BalanceOf<T> = T::TicketPrice::get();
		const LuckyPeriod: T::BlockNumber = T::LuckyPeriod::get();

		const ModuleId: ModuleId = T::ModuleId::get();

		// Events must be initialized if they are used by the pallet.
		fn deposit_event() = default ;


		/// Users can buy a lottery ticket and do something else with
		/// one extrinsic. The lottery rule is that the user can
		/// only buy one ticket in current round lottery
		#[weight = 0]
		fn buy_ticket(
			origin,
			call: Box<<T as Trait>::Call>,
		) {
			let who = ensure_signed(origin)?;
			let next_lottery_id = Self::next_lottery_index();
			// get current lottery
			let current_lottery_index =
				if next_lottery_id == 0 { 0 } else { next_lottery_id - 1 };
			let mut lottery = Self::lottery_info(&current_lottery_index).ok_or(Error::<T>::NotExists)?;

			Self::enter_lottery(&who, &mut lottery)?;
			Self::deposit_event(RawEvent::BuyTicket(who, current_lottery_index));
		}

		#[weight = 0]
		fn claim_reward(origin, lotteries: Vec<LottoIndex>) {
			let who = ensure_signed(origin)?;
			for id in lotteries {
				let mut lotto = Self::lottery_info(id).ok_or(Error::<T>::NotExists)?;
				if let Ok(r) = Self::claim_single_reward(&who, &mut lotto) {
					Self::deposit_event(RawEvent::RewardClaimed(id, who.clone(), r));
				}
			}
		}

	}
}


impl<T: Trait> Module<T> {
    fn account_id() -> T::AccountId {
        T::ModuleId::get().into_account()
    }

    /// Create a new lottery
    fn start_new_lottery(lottery_kind: LotteryKind) -> DispatchResult {
        let lottery_id = Self::next_lottery_index();
        // if it is not the first lottery, we need to ensure that
        // last lottery has ended
        if lottery_id != 0 {
            let last_lottery = Self::lottery_info(lottery_id - 1).ok_or(Error::<T>::NotExists)?;
            ensure!(last_lottery.has_ended(), Error::<T>::NotEnded);
        }
        // create a new lottery
        let lottery = Lottery::new(lottery_id, lottery_kind);
        //
        LotteryInfo::<T>::try_mutate(lottery_id, |lotto| -> DispatchResult {
            ensure!(lotto.is_none(), Error::<T>::AlreadyExisted);
            *lotto = Some(lottery);
            Ok(())
        })?;
        // increase the lottery index
        NextLotteryIndex::mutate(|id| *id += 1);
        Self::deposit_event(RawEvent::NewRound(lottery_id));
        Ok(())
    }

    /// Enter a lottery
    fn enter_lottery(
        who: &T::AccountId,
        lottery: &mut Lottery<T::AccountId, BalanceOf<T>>
    ) -> DispatchResult {
        // Make sure the lottery has not ended
        ensure!(!lottery.has_ended(), Error::<T>::AlreadyEnded);
        // Each user can only participate once in a single round
        ensure!(!lottery.is_player(who), Error::<T>::OnlyOnce);
        // buy a ticket
        let ticket_price = T::TicketPrice::get();
        T::Currency::transfer(who, &Self::account_id(), ticket_price, ExistenceRequirement::KeepAlive)?;

        let ticket_number = lottery.next_ticket_id;
        lottery.players.insert(who.clone(), false);
        lottery.tickets.insert(ticket_number, who.clone());
        lottery.next_ticket_id += 1;
        lottery.jackpot += ticket_price;
        Ok(())
    }

    fn draw(lottery: &mut Lottery<T::AccountId, BalanceOf<T>>) -> DispatchResult {
        // Make sure the lottery has not ended
        ensure!(!lottery.has_ended(), Error::<T>::AlreadyEnded);
        let buyer_count = lottery.next_ticket_id;
        let lotto_round = lottery.round;
        let total_reward = lottery.jackpot;

        if buyer_count != 0 {
            match lottery.kind {
                LotteryKind::Routine => {
                    let phrase = b"lottery_draw";
                    // get the random seed and transform it into u32
                    let seed = T::Randomness::random(phrase);
                    let seed: &[u8] = seed.as_ref();

                    let seed_u32: u32 = seed[0] as u32 + (seed[1] as u32) << 8 + (seed[2] as u32) << 16 + (seed[3] as u32) << 24;
                    // find the winner
                    let lucky_number = seed_u32.rem(buyer_count);
                    let winner = lottery.tickets.get(&lucky_number).unwrap();
                    Self::deposit_event(RawEvent::RoutineLottoDraw(lotto_round, winner.clone()));
                    lottery.draw(LottoResult::Routine(winner.clone(), total_reward));

                },

                LotteryKind::TreasuryFunded(_) => {
                    let individual_reward = total_reward / buyer_count.into();
                    Self::deposit_event(RawEvent::FundedLottoDraw(lotto_round, individual_reward));
                    lottery.draw(LottoResult::TreasuryFunded(individual_reward));
                }
            }
        } else {
            // do nothing if there are no players
        }

        Ok(())
    }

    fn claim_single_reward(
        who: &T::AccountId,
        lottery: &mut Lottery<T::AccountId, BalanceOf<T>>
    ) -> result::Result<BalanceOf<T>, DispatchError> {

        // ensure this lottery has ended(got a result)
        ensure!(lottery.has_ended(), Error::<T>::NotEnded);

        // if `who` is the winner and has not claimed the reward
        if lottery.able_to_claim(who) {

            let module_account = Self::account_id();

            let reward: BalanceOf<T> = match lottery.result.as_ref().unwrap() {
                LottoResult::Routine(_, r) => *r,
                LottoResult::TreasuryFunded(r) => *r,
            };
            // claim the reward
            T::Currency::transfer(&module_account, who, reward, ExistenceRequirement::KeepAlive)?;
            lottery.claim(who);

            Ok(reward)
        } else {
            Err(Error::<T>::ClaimFailed.into())
        }
    }


}