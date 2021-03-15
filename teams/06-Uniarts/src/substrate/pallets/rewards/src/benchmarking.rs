//! Rewards pallet benchmarking.

#![cfg(feature = "runtime-benchmarks")]

use super::*;
use sp_std::prelude::*;
use frame_system::RawOrigin;
use frame_support::{traits::OnFinalize};
use frame_benchmarking::benchmarks;
use crate::Module as Rewards;
use sp_runtime::generic::DigestItem;
use codec::{Encode};

const MAX_TIME: u32 = 100;

benchmarks! {
	_ { }

	claim {
		let validators = pallet_session::Module::<T>::validators();
		// let validators_size: usize = validators.len();
		// let i in 0..validators_size;
		let validator = validators[0].clone();
		let miner = T::AccountIdOf::convert(validator).unwrap();
		// let rewards = Rewards::<T>::current_reward_per_block();
		let rewards = T::RewardThreshold::get();
		Rewards::<T>::set_rewards(miner.clone(), rewards, Zero::zero());
		Rewards::<T>::set_rewards(miner.clone(), rewards, Zero::zero());
	}: claim(RawOrigin::Signed(miner.clone()))
	verify {
		// assert_eq!(Rewards::<T>::immature_rewards(&miner).0, rewards);
		assert_eq!(Rewards::<T>::mature_rewards(&miner), Zero::zero());
	}

	on_finalize {
		let _ = Rewards::<T>::set_start_block(RawOrigin::Root.into(), Zero::zero());
		let t in 1 .. MAX_TIME;

		let slot = 1u64;
		let log: DigestItem<T::Hash> = DigestItem::PreRuntime(
			sp_consensus_aura::AURA_ENGINE_ID,
			slot.encode()
		);
		<frame_system::Module<T>>::deposit_log(log.into());

		let prev_mined_rewards = Rewards::<T>::mined_rewards();
	}: { Rewards::<T>::on_finalize(t.into()); }
	verify {
		let rewards_per_block = Rewards::<T>::current_reward_per_block();
		assert_eq!(Rewards::<T>::mined_rewards(), prev_mined_rewards + rewards_per_block);
	}
}

#[cfg(test)]
mod tests {
	
}

