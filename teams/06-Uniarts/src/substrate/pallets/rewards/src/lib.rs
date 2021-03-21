#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{
	decl_module, decl_storage, 
	decl_event, decl_error, 
	dispatch, ensure,
	Parameter,
	traits::{Currency, Get, FindAuthor},
	weights::Weight,
};
use frame_system::{ensure_signed, ensure_root};

use sp_runtime::{
	// RuntimeDebug, DispatchResult, DispatchError, RuntimeAppPublic,
	traits::{
		Zero, One,
		// StaticLookup, CheckedAdd, CheckedSub,
		// Saturating, Bounded, IdentifyAccount,
		Saturating,
		AtLeast32BitUnsigned, Member, MaybeSerializeDeserialize, Convert
	}
};

use codec::Codec;

pub mod default_weights;
mod benchmarking;

pub trait WeightInfo {
	fn claim() -> Weight;
	fn on_finalize() -> Weight;
}


pub type BalanceOf<T> =
	<<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::Balance;
pub type AccountId<T> = <T as frame_system::Trait>::AccountId;

/// Configure the pallet by specifying the parameters and types on which it depends.
pub trait Trait: pallet_aura::Trait + pallet_session::Trait {
	// Because this pallet emits events, it depends on the runtime's definition of an event.
	type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

	type Balance: Parameter + Member + AtLeast32BitUnsigned + Codec + Default + Copy +
		MaybeSerializeDeserialize;

	type Currency: Currency<AccountId<Self>> + Send + Sync;
	type RewardPerBlock: Get<BalanceOf<Self>>;
	type BlocksPerYear: Get<Self::BlockNumber>;
	type RewardThreshold: Get<BalanceOf<Self>>;
	type MiningCap: Get<BalanceOf<Self>>;

	type AccountIdOf: Convert<Self::ValidatorId, Option<AccountId<Self>>>;
	type WeightInfo: WeightInfo;
}


// The pallet's runtime storage items.
decl_storage! {
	trait Store for Module<T: Trait> as Rewards {
		pub MatureRewards get(fn mature_rewards): map hasher(twox_64_concat) AccountId<T> => BalanceOf<T>;
		pub ImmatureRewards get(fn immature_rewards): map hasher(twox_64_concat) AccountId<T> => (BalanceOf<T>, T::BlockNumber);

		
		pub MinedRewards get(fn mined_rewards): BalanceOf<T>;
		pub CurrentRewardsPerBlock get(fn current_reward_per_block): BalanceOf<T> = T::RewardPerBlock::get();
		pub StartBlock get(fn start_block): Option<T::BlockNumber>;
	}
}


decl_event!(
	pub enum Event<T> 
		where 
			AccountId = AccountId<T>,
			Balance = BalanceOf<T>,
	{
		ClaimReward(AccountId, Balance),
	}
);

// Errors inform users that something went wrong.
decl_error! {
	pub enum Error for Module<T: Trait> {
		NoReward,
	}
}

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		type Error = Error<T>;
		fn deposit_event() = default;

		#[weight = 0]
		pub fn set_start_block(origin, number: T::BlockNumber) -> dispatch::DispatchResult {
			ensure_root(origin)?;
			if Self::start_block() == None {
				<StartBlock<T>>::put(number);	
			}
			Ok(())
		}

		#[weight = <T as Trait>::WeightInfo::claim()]
		pub fn claim(origin) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			let mut rewards = Self::mature_rewards(&who);
			ensure!(rewards > Zero::zero(), Error::<T>::NoReward);

			<MatureRewards<T>>::mutate(&who, |val|
				*val = Zero::zero()
			);
			let now = frame_system::Module::<T>::block_number();
			let (immature_rewards, n) = Self::immature_rewards(&who);
			if now > n + <T as frame_system::Trait>::BlockNumber::from(14400 * 14) {
				rewards = rewards.saturating_add(immature_rewards);
			}

			Self::payout_rewards(who.clone(), rewards);
			Self::deposit_event(RawEvent::ClaimReward(who.clone(), rewards));

			Ok(())
		}

		fn on_finalize(now: T::BlockNumber) {

			let start = match Self::start_block() {
				None => return,
				Some(n) => n,
			};

			if start > now {
				return
			}
			// Reach to hard cap
			if Self::mined_rewards() >= T::MiningCap::get() {
				return;
			}

			let logs = frame_system::Module::<T>::digest().logs;
			let digest = logs.iter().filter_map(|s| s.as_pre_runtime());
			
			if let Some(index) = pallet_aura::Module::<T>::find_author(digest) {
				let validator = pallet_session::Module::<T>::validators()[index as usize].clone();
				if let Some(account) = T::AccountIdOf::convert(validator) {
					let pre_year = now.saturating_sub(One::one()) / T::BlocksPerYear::get() + One::one();
					let year = now / T::BlocksPerYear::get() + One::one();

					if pre_year + One::one() == year {
						let numerator = BalanceOf::<T>::from(8);
						let denominator = BalanceOf::<T>::from(10);
						<CurrentRewardsPerBlock<T>>::mutate(|current| *current = current.saturating_mul(numerator) / denominator);
					}

					Self::set_rewards(account, Self::current_reward_per_block(), now);
				}
			}
		}
	}
}


impl<T: Trait> Module<T> {
	fn payout_rewards(author: AccountId<T>, amount: BalanceOf<T>) {
		let _ = T::Currency::deposit_into_existing(&author, amount);
	}

	fn set_rewards(account: AccountId<T>, reward: BalanceOf<T>, now: T::BlockNumber) {
		let (immature_rewards, _) = Self::immature_rewards(&account);
		if immature_rewards < T::RewardThreshold::get() {
			<ImmatureRewards<T>>::mutate(&account, |val|
				*val = (val.0.saturating_add(reward), now)
			);
		} else {
			<MatureRewards<T>>::mutate(&account, |rewards|
				*rewards = rewards.saturating_add(reward)
			);
		}
		<MinedRewards<T>>::mutate(|mined| *mined = mined.saturating_add(reward));

	}
}
