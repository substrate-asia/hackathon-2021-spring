#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::unused_unit)]
#![allow(clippy::upper_case_acronyms)]

use frame_support::{pallet_prelude::*, transactional};
use frame_system::{
	offchain::{SendTransactionTypes, SubmitTransaction},
	pallet_prelude::*,
};
use debt::Debit;
use orml_traits::Change;
use orml_utilities::{IterableStorageDoubleMapExtended, OffchainErr};
use sp_runtime::{
	offchain::{
		storage::StorageValueRef,
		storage_lock::{StorageLock, Time},
		Duration,
	},
	traits::{BlakeTwo256, Bounded, Convert, Hash, Saturating, StaticLookup, Zero},
	transaction_validity::{
		InvalidTransaction, TransactionPriority, TransactionSource, TransactionValidity, ValidTransaction,
	},
	DispatchError, DispatchResult, FixedPointNumber, RandomNumberGenerator, RuntimeDebug,
};
use sp_std::prelude::*;
use model::{
	DEXManager, Price, PriceManager, Ratio, Amount, Balance, CurrencyId, AssetPoolId,
};

pub use module::*;

pub const OFFCHAIN_WORKER_DATA: &[u8] = b"mybank/liquidation/data/";
pub const OFFCHAIN_WORKER_LOCK: &[u8] = b"mybank/liquidation/lock/";
pub const OFFCHAIN_WORKER_MAX_ITERATIONS: &[u8] = b"mybank/liquidation/max-iterations/";
pub const LOCK_DURATION: u64 = 100;
pub const DEFAULT_MAX_ITERATIONS: u32 = 1000;

pub type DebitCreditOf<T> = debt::Module<T>;

#[derive(Encode, Decode, Clone, RuntimeDebug, PartialEq, Eq, Default)]
pub struct AssetPoolParam {
	pub maximum_total_debit_ratio: Ratio,

	pub minimum_debit_value: Balance,

	pub reserve_factor: Ratio,
}

#[frame_support::pallet]
pub mod module {
	use super::*;
	use sp_core::offchain::Capability::Randomness;

	#[pallet::config]
	pub trait Config: frame_system::Config + debt::Config + SendTransactionTypes<Call<Self>> {
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;

		// TODO
		type WhiteListOrigin: EnsureOrigin<Self::Origin>;

		type PriceManager: PriceManager<CurrencyId>;

		type DEXManager: DEXManager<Self::AccountId, CurrencyId, Balance>;

		#[pallet::constant]
		type AssetPoolIds: Get<Vec<CurrencyId>>;

		#[pallet::constant]
		type UnsignedPriority: Get<TransactionPriority>;
	}

	#[pallet::error]
	pub enum Error<T> {}

	#[pallet::event]
	#[pallet::generate_deposit(pub (crate) fn deposit_event)]
	pub enum Event<T: Config> {}

	#[pallet::storage]
	#[pallet::getter(fn debit_ratios)]
	pub type DebitRatioMap<T: Config> = StorageMap<_, Twox64Concat, AssetPoolId, Ratio, OptionQuery>;

	#[pallet::storage]
	#[pallet::getter(fn deposit_ratios)]
	pub type DepositRatioMap<T: Config> = StorageMap<_, Twox64Concat, AssetPoolId, Ratio, OptionQuery>;

	#[pallet::storage]
	#[pallet::getter(fn asset_pool_params)]
	pub type AssetPoolParamMap<T: Config> = StorageMap<_, Twox64Concat, AssetPoolId, AssetPoolParam, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn liquidation_ratio_params)]
	pub type LiquidationRatioParamMap<T: Config> = StorageMap<_, Twox64Concat, AssetPoolId, Ratio, ValueQuery>;

	#[pallet::genesis_config]
	pub struct GenesisConfig {
		#[allow(clippy::type_complexity)]
		pub asset_pool_params: Vec<(
			CurrencyId,
			Ratio,
			Balance,
			Ratio,
		)>,
		pub liquidation_ratio_params: Vec<(
			CurrencyId,
			Ratio,
		)>,
	}

	#[cfg(feature = "std")]
	impl Default for GenesisConfig {
		fn default() -> Self {
			GenesisConfig {
				asset_pool_params: vec![],
				liquidation_ratio_params: vec![],
			}
		}
	}

	#[pallet::genesis_build]
	impl<T: Config> GenesisBuild<T> for GenesisConfig {
		fn build(&self) {
			self.asset_pool_params.iter().for_each(
				|(currency_id, maximum_total_debit_ratio, minimum_debit_value, reserve_factor)| {
					AssetPoolParamMap::<T>::insert(
						currency_id,
						AssetPoolParam {
							maximum_total_debit_ratio: *maximum_total_debit_ratio,
							minimum_debit_value: *minimum_debit_value,
							reserve_factor: *reserve_factor,
						},
					);
				},
			);
			self.liquidation_ratio_params.iter().for_each(
				|(currency_id, liquidation_ratio)| {
					LiquidationRatioParamMap::<T>::insert(currency_id, liquidation_ratio);
				},
			);
		}
	}

	#[pallet::pallet]
	pub struct Pallet<T>(PhantomData<T>);

	// TODO: impl interest rate model
	#[pallet::hooks]
	impl<T: Config> Hooks<T::BlockNumber> for Pallet<T> {
		fn on_finalize(_now: T::BlockNumber) {
			for asset_pool_id in T::AssetPoolIds::get() {
				let debit_ratio = Self::debit_ratios(asset_pool_id).unwrap_or_default();
				// TODO
				let interest_rate: Ratio = Ratio::zero();
				let reserve_factor = Self::asset_pool_params(asset_pool_id).reserve_factor;
				let total_debit = <DebitCreditOf<T>>::total_debit(asset_pool_id);

				if !interest_rate.is_zero() && !total_debit.is_zero() {
					let debit_ratio_increment = debit_ratio.saturating_mul(interest_rate);
					let new_debit_ratio = debit_ratio.saturating_add(debit_ratio_increment);
					DebitRatioMap::<T>::insert(asset_pool_id, new_debit_ratio);
					let new_deposit_ratio = new_debit_ratio.saturating_mul(reserve_factor);
					DepositRatioMap::<T>::insert(asset_pool_id, new_deposit_ratio);
				}
			}
		}

		/// Runs after every block. Check debit-ratio and submit unsigned tx to trigger liquidation.
		fn offchain_worker(now: T::BlockNumber) {
			// TODO print log
			if let Err(e) = Self::_offchain_worker() {
				// debug::info!(target: "liquidation offchain worker failed");
			}
		}
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::weight(0)]
		#[transactional]
		pub fn liquidate(
			origin: OriginFor<T>,
			currency_id: CurrencyId,
			who: <T::Lookup as StaticLookup>::Source,
		) -> DispatchResultWithPostInfo {
			ensure_none(origin)?;
			let who = T::Lookup::lookup(who)?;
			Self::liquidate_unsafe_debit(who, currency_id)?;
			Ok(().into())
		}
	}

	impl<T: Config> Pallet<T> {
		// TODO
		pub fn liquidate_unsafe_debit(who: T::AccountId, currency_id: CurrencyId) -> DispatchResult {
			Ok(())
		}

		fn submit_unsigned_liquidation_tx(currency_id: CurrencyId, who: T::AccountId) {
			let who = T::Lookup::unlookup(who);
			let call = Call::<T>::liquidate(currency_id, who.clone());
			if SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(call.into()).is_err() {
				debug::info!("failed");
			}
		}

		fn _offchain_worker() -> Result<(), OffchainErr> {
			let asset_pool_ids = T::AssetPoolIds::get();
			if asset_pool_ids.len().is_zero() {
				return Ok(());
			}

			// check if we are a potential validator
			if !sp_io::offchain::is_validator() {
				return Err(OffchainErr::NotValidator);
			}

			// acquire offchain worker lock
			let lock_expiration = Duration::from_millis(LOCK_DURATION);
			let mut lock = StorageLock::<'_, Time>::with_deadline(&OFFCHAIN_WORKER_LOCK, lock_expiration);
			let mut guard = lock.try_lock().map_err(|_| OffchainErr::OffchainLock)?;

			let to_be_continue = StorageValueRef::persistent(&OFFCHAIN_WORKER_DATA);

			// get to_be_continue record
			let (asset_pool_id, start_key) =
				if let Some(Some((last_asset_pool_id, maybe_last_iterator_previous_key))) = to_be_continue.get::<(u32, Option<Vec<u8>>)>()
				{
					(last_asset_pool_id, maybe_last_iterator_previous_key)
				} else {
					let random_seed = sp_io::offchain::random_seed();
					let mut rng = RandomNumberGenerator::<BlakeTwo256>::new(BlakeTwo256::hash(&random_seed[..]));
					(rng.pick_u32(asset_pool_ids.len().saturating_sub(1) as u32), None)
				};

			let max_iterations = StorageValueRef::persistent(&OFFCHAIN_WORKER_MAX_ITERATIONS)
				.get::<u32>()
				.unwrap_or(Some(DEFAULT_MAX_ITERATIONS));

			let currency_id = asset_pool_ids[(asset_pool_id as usize)];
			let mut map_iterator = <debt::DebitMap<T> as
			IterableStorageDoubleMapExtended<_, _, _>>::iter_prefix(currency_id, max_iterations, start_key.clone());

			let mut iteration_count = 0;
			while let Some((who, Debit { collateral_type, collateral, debit })) = map_iterator.next() {
				if Self::is_debit_unsafe(currency_id, collateral, collateral_type, debit) {
					Self::submit_unsigned_liquidation_tx(currency_id, who);
				}

				iteration_count += 1;

				guard.extend_lock().map_err(|_| OffchainErr::OffchainLock)?;
			}

			if map_iterator.finished {
				let next_asset_pool_id =
					if asset_pool_id < asset_pool_ids.len().saturating_sub(1) as u32 {
						asset_pool_id + 1
					} else {
						0
					};
				to_be_continue.set(&(next_asset_pool_id, Option::<Vec<u8>>::None));
			} else {
				to_be_continue.set(&(asset_pool_id, Some(map_iterator.map_iterator.previous_key)));
			}

			guard.forget();

			Ok(())
		}

		pub fn is_debit_unsafe(currency_id: CurrencyId, collateral: Balance, collateral_type: CurrencyId, debit: Balance) -> bool {
			if let Some(feed_price) = T::PriceManager::get_relative_price(currency_id, collateral_type) {
				let collateral_ratio = Self::calculate_collateral_ratio(currency_id, collateral, debit, feed_price);
				collateral_ratio < Self::liquidation_ratio_params(currency_id)
			} else {
				false
			}
		}

		pub fn calculate_collateral_ratio(
			currency_id: CurrencyId,
			collateral_balance: Balance,
			debit_balance: Balance,
			price: Price,
		) -> Ratio {
			let locked_collateral_value = price.saturating_mul_int(collateral_balance);
			let debit_value = Self::get_debit_value(currency_id, debit_balance);

			Ratio::checked_from_rational(locked_collateral_value, debit_value).unwrap_or_default()
		}

		pub fn get_debit_value(currency_id: CurrencyId, debit_balance: Balance) -> Balance {
			// TODO: default value
			Self::debit_ratios(currency_id).unwrap_or_default().saturating_mul_int(debit_balance)
		}
	}

	#[pallet::validate_unsigned]
	impl<T: Config> ValidateUnsigned for Pallet<T> {
		type Call = Call<T>;

		fn validate_unsigned(_source: TransactionSource, call: &Self::Call) -> TransactionValidity {
			match call {
				Call::liquidate(currency_id, who) => {
					let account = T::Lookup::lookup(who.clone())?;
					// TODO
					let Debit { collateral_type, collateral, debit } = <DebitCreditOf<T>>::debits(currency_id, &account);
					if !Self::is_debit_unsafe(*currency_id, collateral, collateral_type, debit) {
						return InvalidTransaction::Stale.into();
					}
					ValidTransaction::with_tag_prefix("LiquidationOffchainWorker")
						.priority(T::UnsignedPriority::get())
						.and_provides((currency_id, who))
						.longevity(64_u64)
						.propagate(true)
						.build()
				}
				_ => InvalidTransaction::Call.into(),
			}
		}
	}
}

