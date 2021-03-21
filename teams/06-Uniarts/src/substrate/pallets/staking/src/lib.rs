#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{
	decl_module, decl_storage, 
	decl_event, decl_error, dispatch, ensure,
	Parameter,
	traits::{Currency, Get, ExistenceRequirement},
	weights::Weight,
};
use frame_system::{ensure_signed, ensure_root};

use sp_runtime::{
	ModuleId,
	traits::{
		AccountIdConversion,
		Zero, One, Saturating, SaturatedConversion,
		AtLeast32Bit, Convert
	}
};
use codec::{Encode, Decode};
use sp_std::prelude::*;

mod default_weights;

pub trait WeightInfo {
	fn stake() -> Weight;
	fn unstake() -> Weight;
}

pub type BalanceOf<T> =
	<<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::Balance;
pub type AccountId<T> = <T as frame_system::Trait>::AccountId;
pub type BlockNumber<T> = <T as frame_system::Trait>::BlockNumber;

/// Configure the pallet by specifying the parameters and types on which it depends.
pub trait Trait: frame_system::Trait {
	type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

	type ModuleId: Get<ModuleId>;
	type Currency: Currency<AccountId<Self>> + Send + Sync;
	type RewardPerBlock: Get<BalanceOf<Self>>;
	type Id: Parameter + AtLeast32Bit + Default + Copy;
	type AmpFactor: Get<BalanceOf<Self>>;
	type ConvertNumberToBalance: Convert<BlockNumber<Self>, BalanceOf<Self>>;
	type WeightInfo: WeightInfo;
}


#[derive(Debug, Encode, Decode, Default, Clone, PartialEq)]
pub struct Pool<Id, Number, Balance, AccountId> {
	pub id: Id,
	pub account: AccountId,
	pub acc_rewards_per_share: Balance,
	pub last_reward_block: Number,
	pub asset_id: Id,
	pub total_balance: Balance,
}

#[derive(Debug, Encode, Decode, Default, Clone, PartialEq)]
pub struct Staker<Balance> {
	pub amount: Balance,
	pub reward: Balance,
	pub debt: Balance,
}

decl_storage! {
	trait Store for Module<T: Trait> as Staking {
		pub Pools get(fn pools): map hasher(twox_64_concat) T::Id => Pool<T::Id, BlockNumber<T>, BalanceOf<T>, AccountId<T>>;
		pub Stakers get(fn stakers): map hasher(blake2_128_concat) (T::Id, AccountId<T>) => Staker<BalanceOf<T>>;
		pub NextPoolId get(fn next_pool_id): T::Id;
	}

	add_extra_genesis {
		build(|_config| {
			// Create Staking account
			let _ = T::Currency::make_free_balance_be(
				&<Module<T>>::account_id(),
				T::Currency::minimum_balance(),
			);
		});
	}
}


decl_event!(
	pub enum Event<T> 
		where 
			AccountId = AccountId<T>,
			Balance = BalanceOf<T>,
			BlockNumber = BlockNumber<T>,
	{
		/// User stakes some assets
		Stake(AccountId, BlockNumber, Balance),
		/// User unstakes some assets
		Unstake(AccountId, BlockNumber, Balance),
		/// User claim rewards
		Rewarded(AccountId, BlockNumber, Balance),
	}
);

// Errors inform users that something went wrong.
decl_error! {
	pub enum Error for Module<T: Trait> {
		/// Staking pool is not exists
		PoolNotExists,
		/// Not staking
		NotStaking,
		/// Insufficient balance
		InsufficientBalance,
		/// Insufficient staking balance
		InsufficientStakingBalance,
	}
}

decl_module! {
	pub struct Module<T: Trait> for enum Call where origin: T::Origin {
		type Error = Error<T>;
		fn deposit_event() = default;

		#[weight = 0]
		pub fn create_pool(origin) -> dispatch::DispatchResult {
			ensure_root(origin.clone())?;

			let id = Self::next_pool_id();
			<NextPoolId<T>>::mutate(|id| *id += One::one());
			let block_number = frame_system::Module::<T>::block_number();
			let zero = BalanceOf::<T>::zero();

			let pool_account_id = Self::pool_account_id(id);

			let pool = Pool {
				id: id,
				account: pool_account_id,
				acc_rewards_per_share: zero,
				last_reward_block: block_number,
				asset_id: Default::default(),
				total_balance: zero,
			};

			<Pools<T>>::insert(id, pool);

			Ok(())
		}

		#[weight = T::WeightInfo::stake()]
		pub fn stake(origin, pool_id: T::Id, amount: BalanceOf<T>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(<Pools<T>>::contains_key(&pool_id), Error::<T>::PoolNotExists);

			let sender_balance = T::Currency::free_balance(&who);
			ensure!(sender_balance >= amount, Error::<T>::InsufficientBalance);

			let pool_account = Self::pool_account_id(pool_id);

			T::Currency::transfer(&who, &pool_account, amount, ExistenceRequirement::KeepAlive)?;

			let block_number = frame_system::Module::<T>::block_number();
			let reward_per_block: BalanceOf<T> = Self::reward_per_block();
			let factor: BalanceOf<T> = T::AmpFactor::get();

			// Update pool
			<Pools<T>>::mutate(pool_id, |pool| {
				if pool.last_reward_block < block_number {
					if pool.total_balance > Zero::zero() {
						let delta = block_number.saturating_sub(pool.last_reward_block);
						let blocks: BalanceOf<T> = T::ConvertNumberToBalance::convert(delta);
						let rewards = reward_per_block.saturating_mul(blocks);

						let rewards_per_share = rewards.saturating_mul(factor) / pool.total_balance;
						pool.acc_rewards_per_share = pool.acc_rewards_per_share.saturating_add(rewards_per_share);
					}
				}
				pool.last_reward_block = block_number;
				pool.total_balance = pool.total_balance.saturating_add(amount);
			});


			let pool = Self::pools(pool_id);

			let staker_key = (pool_id, who.clone());

			if <Stakers<T>>::contains_key(&staker_key) {
				<Stakers<T>>::mutate(staker_key, |staker| {
					let pending_reward = staker.amount.saturating_mul(pool.acc_rewards_per_share) / factor - staker.debt;
					staker.reward = staker.reward.saturating_add(pending_reward);
					staker.amount = staker.amount.saturating_add(amount);
					staker.debt = staker.amount * pool.acc_rewards_per_share / factor;
				});
			} else {
				let staker = Staker {
					// user: who.clone(),
					amount: amount,
					reward: Zero::zero(),
					debt: amount * pool.acc_rewards_per_share / factor,
				};
				<Stakers<T>>::insert(staker_key.clone(), staker);
			}

			Self::deposit_event(RawEvent::Stake(who.clone(), block_number, amount));
			Ok(())
		}

		#[weight = T::WeightInfo::unstake()]
		pub fn unstake(origin, pool_id: T::Id, amount: BalanceOf<T>) -> dispatch::DispatchResult {
			let who = ensure_signed(origin)?;
			ensure!(<Pools<T>>::contains_key(&pool_id), Error::<T>::PoolNotExists);
			let pool_account = Self::pool_account_id(pool_id);

			let block_number = frame_system::Module::<T>::block_number();
			let reward_per_block: BalanceOf<T> = Self::reward_per_block();
			let factor: BalanceOf<T> = T::AmpFactor::get();

			let staker_key = (pool_id, who.clone());
			ensure!(<Stakers<T>>::contains_key(&staker_key), Error::<T>::NotStaking);

			let staker = Self::stakers(&staker_key);
			ensure!(staker.amount >= amount, Error::<T>::InsufficientStakingBalance);

			// Update pool
			<Pools<T>>::mutate(pool_id, |pool| {
				if pool.last_reward_block < block_number {
					if pool.total_balance > Zero::zero() {
						let delta = block_number.saturating_sub(pool.last_reward_block);
						let blocks: BalanceOf<T> = T::ConvertNumberToBalance::convert(delta);
						let rewards = reward_per_block.saturating_mul(blocks);
						let rewards_per_share = rewards.saturating_mul(factor) / pool.total_balance;
						pool.acc_rewards_per_share = pool.acc_rewards_per_share.saturating_add(rewards_per_share);
					}
				}
				pool.last_reward_block = block_number;
				pool.total_balance = pool.total_balance.saturating_sub(amount);
			});

			let pool = Self::pools(pool_id);

			<Stakers<T>>::mutate(staker_key, |staker| {
				let pending_reward = staker.amount.saturating_mul(pool.acc_rewards_per_share) / factor - staker.debt;
				staker.reward = staker.reward.saturating_add(pending_reward);
				staker.amount = staker.amount.saturating_sub(amount);
				staker.debt = staker.amount.saturating_mul(pool.acc_rewards_per_share) / factor;
			});

			T::Currency::transfer(&pool_account, &who, amount, ExistenceRequirement::KeepAlive)?;

			Self::deposit_event(RawEvent::Unstake(who.clone(), block_number, amount));

			Ok(())
		}

		// #[weight = 10_000]
		// pub fn claim(origin, pool_id: T::Id) -> dispatch::DispatchResult {
		// 	let who = ensure_signed(origin)?;
		// 	let block_number = frame_system::Module::<T>::block_number();
		// 	let staker_key = (pool_id, who.clone());
		// 	ensure!(<Stakers<T>>::contains_key(&staker_key), Error::<T>::NotStaking);
		// 	let staker = Self::stakers(staker_key.clone());
		// 	let reward = staker.reward;
		// 	<Stakers<T>>::mutate(staker_key, |staker| {
		// 		staker.reward = Zero::zero();
		// 	});

		// 	// TODO deposit rewards to user
		// 	Self::deposit_event(RawEvent::Rewarded(who.clone(), block_number, reward));

		// 	Ok(())
		// }

		// #[weight = 10_000]
		// pub fn exit(origin, pool_id: T::Id) -> dispatch::DispatchResult {
		// 	let who = ensure_signed(origin)?;
		// 	ensure!(<Pools<T>>::contains_key(&pool_id), Error::<T>::PoolNotExists);
			
		// 	Ok(())
		// }

	}
}


impl<T: Trait> Module<T> {
	pub fn account_id() -> T::AccountId {
		T::ModuleId::get().into_account()
	}

	pub fn pool_account_id(pool_id: T::Id) -> T::AccountId {
		let pid = pool_id.saturated_into::<u8>();
		let mut id = [0u8; 8];
		id[0..7].copy_from_slice(&*b"staking");
		id[7] = pid;
		ModuleId(id).into_account()
	}

	pub fn reward_per_block() -> BalanceOf<T> {
		// TODO: adjust rewards of staking 
		T::RewardPerBlock::get()
	}

	/// Pending rewards of staker
	pub fn pending_rewards(pool_id: T::Id, account_id: T::AccountId) -> BalanceOf<T> {
		let staker_key = (pool_id, account_id);
		let staker = Self::stakers(&staker_key);
		let pool = Self::pools(pool_id);

		let block_number = frame_system::Module::<T>::block_number();
		let reward_per_block: BalanceOf<T> = Self::reward_per_block();
		let factor: BalanceOf<T> = T::AmpFactor::get();

		let delta = block_number.saturating_sub(pool.last_reward_block);
		let blocks: BalanceOf<T> = T::ConvertNumberToBalance::convert(delta);
		let rewards = reward_per_block.saturating_mul(blocks);
		if pool.total_balance == Zero::zero() {
			return Zero::zero();
		}
		let rewards_per_share = rewards.saturating_mul(factor) / pool.total_balance;
		let acc_rewards_per_share = pool.acc_rewards_per_share.saturating_add(rewards_per_share);
		staker.amount.saturating_mul(acc_rewards_per_share) / factor - staker.debt
	}
}
	