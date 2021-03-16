#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::unused_unit)]
#![allow(clippy::collapsible_if)]

use frame_support::{pallet_prelude::*, transactional};
use frame_system::pallet_prelude::*;
use orml_traits::{MultiCurrency, MultiCurrencyExtended};
use sp_runtime::{
	traits::{AccountIdConversion, Convert, Zero},
	DispatchResult, ModuleId, RuntimeDebug,
};
use sp_std::{convert::TryInto, result};
use model::{CurrencyId, AssetPoolId, Balance, Amount};

pub use module::*;

#[derive(Encode, Decode, Eq, PartialEq, Copy, Clone, RuntimeDebug, Default)]
pub struct Debit {
	pub collateral_type: CurrencyId,
	pub collateral: Balance,
	pub debit: Balance,
}

#[frame_support::pallet]
pub mod module {
	use super::*;

	#[pallet::config]
	pub trait Config: frame_system::Config {
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;

		type Currency: MultiCurrencyExtended<Self::AccountId, CurrencyId=CurrencyId, Balance=Balance, Amount=Amount>;

		#[pallet::constant]
		type ModuleId: Get<ModuleId>;
	}

	// TODO: impl debits
	#[pallet::storage]
	#[pallet::getter(fn total_debit)]
	pub type TotalDebit<T: Config> = StorageMap<_, Twox64Concat, AssetPoolId, Balance, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn total_deposit)]
	pub type TotalDeposit<T: Config> = StorageMap<_, Twox64Concat, AssetPoolId, Balance, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn total_collateral)]
	pub type TotalCollateral<T: Config> = StorageDoubleMap<_, Twox64Concat, AssetPoolId, Twox64Concat, CurrencyId, Balance, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn deposits)]
	pub type DepositMap<T: Config> = StorageDoubleMap<_, Twox64Concat, AssetPoolId, Twox64Concat, T::AccountId, Balance, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn debits)]
	pub type DebitMap<T: Config> = StorageDoubleMap<_, Twox64Concat, AssetPoolId, Twox64Concat, T::AccountId, Debit, ValueQuery>;

	#[pallet::pallet]
	pub struct Pallet<T>(PhantomData<T>);

	#[pallet::hooks]
	impl<T: Config> Hooks<T::BlockNumber> for Pallet<T> {}

	#[pallet::call]
	impl<T: Config> Pallet<T> {}

	#[pallet::error]
	pub enum Error<T> {
		DepositOverflow,
		DepositTooLow,
		DebitOverflow,
		DebitTooLow,
		CollateralOverflow,
		CollateralTooLow,
		AmountConvertFailed,
	}

	#[pallet::event]
	#[pallet::generate_deposit(pub (crate) fn deposit_event)]
	pub enum Event<T: Config> {
		DepositUpdated(T::AccountId, AssetPoolId, Amount),
		DebitUpdated(T::AccountId, AssetPoolId, Amount),
		CollateralUpdated(T::AccountId, AssetPoolId, Amount),
	}
}

impl<T: Config> Pallet<T> {
	pub fn account_id() -> T::AccountId {
		T::ModuleId::get().into_account()
	}

	#[transactional]
	pub fn update_deposit(who: &T::AccountId, asset_pool_id: AssetPoolId, deposit_adjustment: Amount) -> DispatchResult {
		let deposit_balance_adjustment = Self::balance_try_from_amount_abs(deposit_adjustment)?;
		let module_account = Self::account_id();

		if deposit_adjustment.is_positive() {
			T::Currency::transfer(asset_pool_id, who, &module_account, deposit_balance_adjustment)?;
		} else if deposit_adjustment.is_negative() {
			T::Currency::transfer(asset_pool_id, &module_account, who, deposit_balance_adjustment)?;
		}

		Self::deposit_event(Event::DepositUpdated(who.clone(), asset_pool_id, deposit_adjustment));
		Ok(())
	}

	fn _update_deposit(who: &T::AccountId, currency_id: CurrencyId, deposit_adjustment: Amount) -> DispatchResult {
		let deposit_balance = Self::balance_try_from_amount_abs(deposit_adjustment)?;

		<DepositMap<T>>::try_mutate_exists(currency_id, who, |deposit| -> DispatchResult {
			let mut d = deposit.take().unwrap_or_default();

			let d = if deposit_adjustment.is_positive() {
				d.checked_add(deposit_balance).ok_or(Error::<T>::DepositOverflow)
			} else {
				d.checked_sub(deposit_balance).ok_or(Error::<T>::DepositTooLow)
			}?;

			if d.is_zero() {
				*deposit = None;
			} else {
				*deposit = Some(d);
			}

			Ok(())
		})?;

		TotalDeposit::<T>::try_mutate(currency_id, |total_deposit| -> DispatchResult {
			*total_deposit = if deposit_adjustment.is_positive() {
				total_deposit.checked_add(deposit_balance).ok_or(Error::<T>::DepositOverflow)
			} else {
				total_deposit.checked_sub(deposit_balance).ok_or(Error::<T>::DepositTooLow)
			}?;

			Ok(())
		})
	}

	#[transactional]
	pub fn update_debit(who: &T::AccountId, asset_pool_id: AssetPoolId, collateral_type: CurrencyId, debit_adjustment: Amount) -> DispatchResult {
		// TODO: need to check ratio
		Self::_update_debit(who, asset_pool_id, collateral_type, debit_adjustment)?;

		let debit_balance_adjustment = Self::balance_try_from_amount_abs(debit_adjustment)?;
		let module_account = Self::account_id();

		if debit_adjustment.is_positive() {
			T::Currency::transfer(asset_pool_id, who, &module_account, debit_balance_adjustment)?;
		} else if debit_adjustment.is_negative() {
			T::Currency::transfer(asset_pool_id, &module_account, who, debit_balance_adjustment)?;
		}

		Self::deposit_event(Event::DebitUpdated(who.clone(), asset_pool_id, debit_adjustment));
		Ok(())
	}

	fn _update_debit(who: &T::AccountId, asset_pool_id: AssetPoolId, collateral_type: CurrencyId, debit_adjustment: Amount) -> DispatchResult {
		let debit_balance = Self::balance_try_from_amount_abs(debit_adjustment)?;

		<DebitMap<T>>::try_mutate_exists(asset_pool_id, who, |debit| -> DispatchResult{
			let mut d = debit.take().unwrap_or_default();

			let new_debit = if debit_adjustment.is_positive() {
				d.debit.checked_add(debit_balance).ok_or(Error::<T>::DebitOverflow)
			} else {
				d.debit.checked_sub(debit_balance).ok_or(Error::<T>::DebitTooLow)
			}?;
			d.debit = new_debit;

			if d.debit.is_zero() {
				*debit = None;
			} else {
				*debit = Some(d);
			}

			Ok(())
		})?;

		TotalDebit::<T>::try_mutate(asset_pool_id, |total_debit| -> DispatchResult {
			*total_debit = if debit_adjustment.is_positive() {
				total_debit.checked_add(debit_balance).ok_or(Error::<T>::DebitOverflow)
			} else {
				total_debit.checked_sub(debit_balance).ok_or(Error::<T>::DebitTooLow)
			}?;

			Ok(())
		})
	}

	#[transactional]
	pub fn update_collateral(who: &T::AccountId, asset_pool_id: AssetPoolId, collateral_type: CurrencyId, collateral_adjustment: Amount) -> DispatchResult {
		// TODO: need to check ratio
		Self::_update_debit(who, asset_pool_id, collateral_type, collateral_adjustment)?;

		let collateral_balance_adjustment = Self::balance_try_from_amount_abs(collateral_adjustment)?;
		let module_account = Self::account_id();

		if collateral_adjustment.is_positive() {
			T::Currency::transfer(asset_pool_id, who, &module_account, collateral_balance_adjustment)?;
		} else if collateral_adjustment.is_negative() {
			T::Currency::transfer(asset_pool_id, &module_account, who, collateral_balance_adjustment)?;
		}

		Self::deposit_event(Event::CollateralUpdated(who.clone(), asset_pool_id, collateral_adjustment));
		Ok(())
	}

	fn _update_collateral(who: &T::AccountId, asset_pool_id: AssetPoolId, collateral_type: CurrencyId, collateral_adjustment: Amount) -> DispatchResult {
		let collateral_debit_balance = Self::balance_try_from_amount_abs(collateral_adjustment)?;

		<DebitMap<T>>::try_mutate_exists(asset_pool_id, who, |debit| -> DispatchResult{
			let mut d = debit.take().unwrap_or_default();

			let new_collateral = if collateral_adjustment.is_positive() {
				d.collateral.checked_add(collateral_debit_balance).ok_or(Error::<T>::CollateralOverflow)
			} else {
				d.collateral.checked_sub(collateral_debit_balance).ok_or(Error::<T>::CollateralTooLow)
			}?;
			d.collateral = new_collateral;

			if d.collateral.is_zero() {
				*debit = None;
			} else {
				*debit = Some(d);
			}

			Ok(())
		})?;

		TotalCollateral::<T>::try_mutate(asset_pool_id, collateral_type, |total_collateral| -> DispatchResult {
			// TODO
			*total_collateral = if collateral_adjustment.is_positive() {
				total_collateral.checked_add(collateral_debit_balance).ok_or(Error::<T>::DebitOverflow)
			} else {
				total_collateral.checked_sub(collateral_debit_balance).ok_or(Error::<T>::DebitTooLow)
			}?;

			Ok(())
		})
	}

	fn amount_try_from_balance(b: Balance) -> result::Result<Amount, Error<T>> {
		TryInto::<Amount>::try_into(b).map_err(|_| Error::<T>::AmountConvertFailed)
	}

	fn balance_try_from_amount_abs(a: Amount) -> result::Result<Balance, Error<T>> {
		TryInto::<Balance>::try_into(a.saturating_abs()).map_err(|_| Error::<T>::AmountConvertFailed)
	}
}
