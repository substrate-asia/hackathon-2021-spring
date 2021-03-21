// 好友申请。对方知道某个账户，添加后，存在两种情况，一是对方响应，成为好友关系；二是对方忽略。对这个函数的调用应该有一种机制来确保不会骚扰到对方
// 最简单的方法是，添加后给对方一笔钱，这看起来很不合理，但认真想一下，似乎可以使用这种方式解决一些问题
// 响应好友。收到一个好友申请时的确认机制。

// 不同中心度的模拟

// 添加别名。一串编码很难对应到个人，这里应该在客户端有一种方法能让用户很清楚的知道某个账户对应的是身边的谁谁，或匿名的lable
// 修改别名。
// 删除别名。
// 这样的数据应该考虑隐私性,长度限制

#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::{
    decl_error, decl_event, decl_module, decl_storage,
    dispatch::{DispatchError, DispatchResult},
    ensure,
    traits::{Currency, EnsureOrigin, Get, OnUnbalanced, ReservableCurrency},
};
use frame_system::ensure_signed;
use sp_runtime::traits::{StaticLookup, Zero};
use sp_std::prelude::*;

type BalanceOf<T> =
    <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;
type NegativeImbalanceOf<T> = <<T as Config>::Currency as Currency<
    <T as frame_system::Config>::AccountId,
>>::NegativeImbalance;

type Lable = Vec<u8>;
type RelationStatus = u8; // 1: 好友申请，2: 好友

pub trait Config: frame_system::Config {
    type Event: From<Event<Self>> + Into<<Self as frame_system::Config>::Event>;

    type Currency: ReservableCurrency<Self::AccountId>;

    type LiquidationFrequency: Get<Self::BlockNumber>;
    // 注意这块的其他触发条件
    type Slashed: OnUnbalanced<NegativeImbalanceOf<Self>>;

    /// 设置lable的押金
    type LableReservationFee: Get<BalanceOf<Self>>;

    /// 在一些场景下必须是账户的拥有人才能发起的操作
    type ForceOrigin: EnsureOrigin<Self::Origin>;

    /// lable的最小长度
    type LableMinLength: Get<usize>;

    /// lable的最大长度
    type LableMaxLength: Get<usize>;
}

decl_storage! {
    trait Store for Module<T: Config> as Alias {
        /// 好友关系
        ContactList: double_map hasher(blake2_128_concat) T::AccountId,hasher(blake2_128_concat) T::AccountId => RelationStatus;

        /// 中心度
        Centrality: map hasher(blake2_128_concat) T::AccountId => u32;

        /// 特征向量中心度
        EigenvectorCentrality: map hasher(blake2_128_concat) T::AccountId => u32;

        /// 传播中心度
        PropagationCentrality: map hasher(blake2_128_concat) T::AccountId => u32;

        /// 中介中心度
        BetweennessCentrality: map hasher(blake2_128_concat) T::AccountId => u32;

        /// lable的存储，key是账户，value是（lable和押金）
        LableOf: map hasher(blake2_128_concat) T::AccountId => Option<(Lable, BalanceOf<T>)>;
    }
}

decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as frame_system::Config>::AccountId,
        Balance = BalanceOf<T>,
    {
        /// 好友申请中. \[who, who\]
        Pendding(AccountId, AccountId),
        /// 新好友链接. \[who, who\]
        NewConnection(AccountId, AccountId),
        /// A lable was set. \[who\]
        LableSet(AccountId),
        /// A lable was forcibly set. \[target\]
        LableForced(AccountId),
        /// A lable was changed. \[who\]
        LableChanged(AccountId),
        /// A lable was cleared, and the given balance returned. \[who, deposit\]
        LableCleared(AccountId, Balance),
        /// A lable was removed and the given balance slashed. \[target, deposit\]
        LableKilled(AccountId, Balance),
    }
);

decl_error! {
    /// Error for the Aliass module.
    pub enum Error for Module<T: Config> {
        /// 没有好友邀请
        NoSuchRequest,
        /// 已经是好友
        AlreadyFriends,
        /// A lable is too short.
        LableTooShort,
        /// A lable is too long.
        LableTooLong,
        /// An account is unlabeled.
        Unlabeled,
    }
}

decl_module! {
    /// Socail module declaration.
    pub struct Module<T: Config> for enum Call where origin: T::Origin {
        type Error = Error<T>;

        fn deposit_event() = default;

        // TODO 像这种到底该咋用
        const LiquidationFrequency: T::BlockNumber = T::LiquidationFrequency::get();

        const LableReservationFee: BalanceOf<T> = T::LableReservationFee::get();

        const MinLableLength: u32 = T::LableMinLength::get() as u32;

        const MaxLableLength: u32 = T::LableMaxLength::get() as u32;


        #[weight = 50_000_000]
        fn add_friend(origin, friend: T::AccountId) {
            let sender = ensure_signed(origin)?;
            // TODO 账号合法性
            ContactList::<T>::insert(sender.clone(), friend.clone(), 1);
            Self::deposit_event(RawEvent::Pendding(sender, friend));
        }

        #[weight = 50_000_000]
        fn establish_connection(origin, friend: T::AccountId) {
            let callee = ensure_signed(origin)?;

            // TODO 账号合法性
            ensure!(ContactList::<T>::get(&friend, &callee) == 1, Error::<T>::NoSuchRequest);

            ContactList::<T>::insert(callee.clone(), friend.clone(), 2);
            ContactList::<T>::insert(friend.clone(), callee.clone(), 2);
            // 中心度
            Self::calculate_centrality(callee.clone(), friend.clone())?;

            Self::deposit_event(RawEvent::NewConnection(callee, friend));
        }

        #[weight = 50_000_000]
        fn set_lable(origin, lable: Lable) {
            let sender = ensure_signed(origin)?;

            ensure!(lable.len() >= T::LableMinLength::get(), Error::<T>::LableTooShort);
            ensure!(lable.len() <= T::LableMaxLength::get(), Error::<T>::LableTooLong);

            let deposit = if let Some((_, deposit)) = <LableOf<T>>::get(&sender) {
                Self::deposit_event(RawEvent::LableChanged(sender.clone()));
                deposit
            } else {
                let deposit = T::LableReservationFee::get();
                T::Currency::reserve(&sender, deposit.clone())?;
                Self::deposit_event(RawEvent::LableSet(sender.clone()));
                deposit
            };

            <LableOf<T>>::insert(&sender, (lable, deposit));
        }

        #[weight = 50_000_000]
        fn change_lable(origin, new_lable: Lable) {
            let sender = ensure_signed(origin)?;

            ensure!(new_lable.len() >= T::LableMinLength::get(), Error::<T>::LableTooShort);
            ensure!(new_lable.len() <= T::LableMaxLength::get(), Error::<T>::LableTooLong);

            let deposit = if let Some((_, deposit)) = <LableOf<T>>::get(&sender) {
                Self::deposit_event(RawEvent::LableChanged(sender.clone()));
                deposit
            } else {
                let deposit = T::LableReservationFee::get();
                T::Currency::reserve(&sender, deposit.clone())?;
                Self::deposit_event(RawEvent::LableSet(sender.clone()));
                deposit
            };

            <LableOf<T>>::insert(&sender, (new_lable, deposit));
        }
        #[weight = 70_000_000]
        fn clear_lable(origin) {
            let sender = ensure_signed(origin)?;

            let deposit = <LableOf<T>>::take(&sender).ok_or(Error::<T>::Unlabeled)?.1;

            let _ = T::Currency::unreserve(&sender, deposit.clone());

            Self::deposit_event(RawEvent::LableCleared(sender, deposit));
        }


        #[weight = 70_000_000]
        fn kill_lable(origin, target: <T::Lookup as StaticLookup>::Source) {
            T::ForceOrigin::ensure_origin(origin)?;

            // Figure out who we're meant to be clearing.
            let target = T::Lookup::lookup(target)?;
            // Grab their deposit (and check that they have one).
            let deposit = <LableOf<T>>::take(&target).ok_or(Error::<T>::Unlabeled)?.1;
            // Slash their deposit from them.
            T::Slashed::on_unbalanced(T::Currency::slash_reserved(&target, deposit.clone()).0);

            Self::deposit_event(RawEvent::LableKilled(target, deposit));
        }

        #[weight = 70_000_000]
        fn force_lable(origin, target: <T::Lookup as StaticLookup>::Source, lable: Lable) {
            T::ForceOrigin::ensure_origin(origin)?;

            let target = T::Lookup::lookup(target)?;
            let deposit = <LableOf<T>>::get(&target).map(|x| x.1).unwrap_or_else(Zero::zero);
            <LableOf<T>>::insert(&target, (lable, deposit));

            Self::deposit_event(RawEvent::LableForced(target));
        }

        fn on_finalize(n: T::BlockNumber) {
            if (n % T::LiquidationFrequency::get()).is_zero() {
                // TODO 计算分值
            }
        }
    }
}

impl<T: Config> Module<T> {
    fn calculate_centrality(caller: T::AccountId, callee: T::AccountId) -> DispatchResult {
        let score = 1;
        let err_info = "addition overflow";

        let caller_centrality = Centrality::<T>::get(&caller);
        let caller_centrality_result = match caller_centrality.checked_add(score) {
            Some(r) => r,
            None => return Err(DispatchError::Other(err_info)),
        };

        let callee_centrality = Centrality::<T>::get(&callee);
        let callee_centrality_result = match callee_centrality.checked_add(score) {
            Some(r) => r,
            None => return Err(DispatchError::Other(err_info)),
        };

        Centrality::<T>::insert(caller, caller_centrality_result);
        Centrality::<T>::insert(callee, callee_centrality_result);

        Ok(())
    }
}
