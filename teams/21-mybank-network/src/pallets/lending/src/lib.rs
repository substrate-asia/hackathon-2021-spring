#![cfg_attr(not(feature = "std"), no_std)]
pub use pallet::*;

// TODO
// 存储， timestamp生成
// 质押
// 担保
#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        dispatch::DispatchResultWithPostInfo,
        pallet_prelude::*,
        traits::{Currency, LockIdentifier, LockableCurrency, ReservableCurrency, WithdrawReasons},
    };
    use frame_system::pallet_prelude::*;

    pub(crate) type BalanceOf<T> =
        <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    const GUARANTEE_ID: LockIdentifier = *b"guarante";

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
        type Currency: ReservableCurrency<Self::AccountId>
            + LockableCurrency<Self::AccountId, Moment = Self::BlockNumber>;
    }

    #[pallet::pallet]
    #[pallet::generate_store(pub(super) trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::event]
    #[pallet::metadata(T::AccountId = "AccountId")]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// 新债务申请. [总借款, 借款额度，币种，利率，周期]
        NewDebtRequest(T::AccountId, BalanceOf<T>, u8, u8, u32),
        /// 新担保金
        NewGuarantee(T::AccountId, BalanceOf<T>),
        /// 担保金续期
        GuaranteeExtended(T::AccountId, BalanceOf<T>),
        /// 担保金解除
        GuaranteeUnlock(T::AccountId, BalanceOf<T>),
    }

    #[pallet::error]
    pub enum Error<T> {}

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        // TODO 不同的币种，这里是不是可以和平台币锚定，再在平台上自由的转换为各个币种提现
        // TODO 参数校验
        // 因为抵押存在，系统总量总是会大于现有的，所以这个不需要担心数额少的问题，要注意的只有上限
        // 其他RPC调用的错误返回
        #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
        pub fn borrow(
            origin: OriginFor<T>,
            tally: BalanceOf<T>,
            currency_id: u8,
            rate: u8,
            debt_maturity: u32,
        ) -> DispatchResultWithPostInfo {
            let caller = ensure_signed(origin)?;
            Self::deposit_event(Event::NewDebtRequest(
                caller,
                tally,
                currency_id,
                rate,
                debt_maturity,
            ));
            Ok(().into())
        }

        #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
        pub fn lock_guarantee(
            origin: OriginFor<T>,
            amount: BalanceOf<T>,
        ) -> DispatchResultWithPostInfo {
            let caller = ensure_signed(origin)?;
            T::Currency::set_lock(GUARANTEE_ID, &caller, amount, WithdrawReasons::all());
            Self::deposit_event(Event::NewGuarantee(caller, amount));
            Ok(().into())
        }

        // TODO 只解除部分押金
        #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
        pub fn unlock_guarantee(
            origin: OriginFor<T>,
            amount: BalanceOf<T>,
        ) -> DispatchResultWithPostInfo {
            let caller = ensure_signed(origin)?;
            T::Currency::remove_lock(GUARANTEE_ID, &caller);
            Self::deposit_event(Event::GuaranteeUnlock(caller, amount));
            Ok(().into())
        }

        #[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
        pub fn extend_guarantee_maturity(
            origin: OriginFor<T>,
            amount: BalanceOf<T>,
        ) -> DispatchResultWithPostInfo {
            let caller = ensure_signed(origin)?;
            T::Currency::extend_lock(GUARANTEE_ID, &caller, amount, WithdrawReasons::all());
            Self::deposit_event(Event::GuaranteeExtended(caller, amount));
            Ok(().into())
        }
    }
}
