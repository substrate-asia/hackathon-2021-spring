/*
 * Copyright (C) 2017-2021 blocktree.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode};
use frame_support::{
    decl_error, decl_event, decl_module, decl_storage, dispatch, ensure,
    sp_runtime::RuntimeDebug,
    traits::{EnsureOrigin, ExistenceRequirement, Get, OnUnbalanced},
    unsigned::{TransactionSource, TransactionValidity},
    Parameter,
};
use frame_system::{ensure_none, ensure_signed};
use pallet_support::MultiCurrencyAccounting;
use sp_runtime::{
    traits::{AccountIdConversion, AtLeast32BitUnsigned, CheckedAdd, CheckedSub, Member, Zero},
    transaction_validity::{InvalidTransaction, TransactionLongevity, ValidTransaction},
    ModuleId,
};
use sp_std::borrow::ToOwned;
use sp_std::prelude::*;

mod mock;
mod tests;

const PALLET_ID: ModuleId = ModuleId(*b"shopping");

/// Alias for the multi-currency provided balance type
type BalanceOf<T> = <<T as Trait>::Currency as MultiCurrencyAccounting>::Balance;
type NegativeImbalanceOf<T> =
    <<T as Trait>::Currency as MultiCurrencyAccounting>::NegativeImbalance;
type OrderInfoOf<T> = OrderInfo<
    <T as frame_system::Trait>::AccountId,
    BalanceOf<T>,
    <T as Trait>::AssetId,
    <T as frame_system::Trait>::BlockNumber,
    <T as frame_system::Trait>::Hash,
>;
type ReturnInfoOf<T> = ReturnInfo<
    <T as frame_system::Trait>::AccountId,
    BalanceOf<T>,
    <T as frame_system::Trait>::BlockNumber,
    <T as frame_system::Trait>::Hash,
>;

/// Configure the pallet by specifying the parameters and types on which it depends.
pub trait Trait: frame_system::Trait {
    /// Because this pallet emits events, it depends on the runtime's definition of an event.
    type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

    /// 资产ID
    type AssetId: Parameter + Member + AtLeast32BitUnsigned + Default + Copy + Into<u64>;

    /// 货币类型
    /// 系统支持的货币
    type Currency: MultiCurrencyAccounting<AccountId = Self::AccountId, CurrencyId = Self::AssetId>;

    /// 购物时限
    /// 当代购者接受了代购订单而超过购物限制时间，订单自动关闭，代购者的保证金支付给消费者，锁定的支付金额和小费退回消费者。
    type ShoppingTimeLimit: Get<Self::BlockNumber>;

    /// 确认收货时限
    /// 当消费者超过了确认收货的限制时间，订单自动完成，支付金额和小费转给代购者。
    type ReceivingTimeLimit: Get<Self::BlockNumber>;

    /// 回应退货时限
    /// 当消费者申请退货，但代购者超过了回应退货限制时间，订单自动关闭，代购者的保证金支付给消费者，锁定的支付金额和小费退回消费者。
    type ResponseReturnTimeLimit: Get<Self::BlockNumber>;

    /// 接受退货时限
    /// 当消费者超过了提交退货运单的限制时间，订单自动完成，支付金额和小费转给代购者。
    type AcceptReturnTimeLimit: Get<Self::BlockNumber>;

    /// 订单清理时限
    /// 当订单处于完结状态下，超过订单清理限制时间，订单会系统删除。
    type ClearTimeLimit: Get<Self::BlockNumber>;

    /// 收入所得者
    /// 交易单有保证金和小费等额外收入，收入所得者有系统配置，一般为国库。
    type OnTransactionPayment: OnUnbalanced<NegativeImbalanceOf<Self>>;

    /// 批准来源
    /// 该模块的一些内部参数调整需要上级批准，一般是理事会或sudo控制者。
    type ApproveOrigin: EnsureOrigin<Self::Origin>;
}

/// 订单状态
#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub enum OrderStatus {
    /// 消费发布代购订单，订单委托中，等待代购者接单。
    Pending,
    /// 代购者已接受代购订单。
    Accepted,
    /// 代购者已购买商品并发货中。
    Shipping,
    /// 消费者已确认收货。
    Received,
    /// 消费者申请退货
    Returning,
    /// 消费者手动关闭订单。
    Closed,
    /// 代购者购物失败。
    Failed,
    /// 订单已归档，链上纪录已删除。
    Archived,
}

/// 商品退货状态
#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub enum ReturnStatus {
    /// 消费者申请退货。
    Applied,
    /// 代购者接受商品退货。
    Accepted,
    /// 代购者不接受商品退货。
    Refused,
    /// 消费者发出要退货的商品。
    Shipping,
    /// 代购者确认退货成功。
    Returned,
    /// 代购者没有回应退货而导致交易失败。
    NoResponse,
    /// 消费者手动关闭订单。
    Closed,
    /// 订单已归档，链上纪录已删除。
    Archived,
}

/// 订单信息
/// 代购交易订单信息
#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub struct OrderInfo<AccountId, Balance, AssetId, BlockNumber, Hash> {
    consumer: AccountId,               //   消费者账户地址
    shopping_agent: Option<AccountId>, // 	代购者账户地址
    payment_amount: Balance,           // 	最终支付给代购者的金额
    tip: Balance,                      // 	最终支付给代购者的小费
    return_amount: Balance,            //   已完成退货的金额
    currency: AssetId,                 // 	支付币种
    status: OrderStatus,               // 	订单状态
    create_time: BlockNumber,          // 	提交时间
    accept_time: BlockNumber,          //	接受时间
    shipping_time: BlockNumber,        //	发货时间
    end_time: BlockNumber,             //   完成时间
    required_deposit: Balance,         // 	保证金要求
    required_credit: u64,              // 	信用值要求
    shipping_hash: Option<Hash>,       // 	发货运单证明
    is_return: bool,                   // 	是否有申请退货
    version: u32,                      // 	交易单版本
}

/// 退货信息
#[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug)]
pub struct ReturnInfo<AccountId, Balance, BlockNumber, Hash> {
    consumer: AccountId,         //消费者账户地址
    shopping_agent: AccountId,   //代购者账户地址
    return_amount: Balance,      //退货金额
    status: ReturnStatus,        //退货状态
    create_time: BlockNumber,    //提交时间
    accept_time: BlockNumber,    //接受时间
    shipping_time: BlockNumber,  //发货时间
    end_time: BlockNumber,       //完成时间
    shipping_hash: Option<Hash>, //退货运单证明
    version: u32,                //交易单版本
}

decl_storage! {

    trait Store for Module<T: Trait> as CommissionedShopping {

        /// 已完成订单总数
        /// 纪录全网已完成的订单总数。
        pub TotalCompletedOrdersNum get(fn get_total_completed_orders_num): u128;

        /// 当前未完成的订单总数
        /// 纪录全网当前未完成的订单总数。
        pub CurrentUncompletedOrdersNum get(fn get_current_uncompleted_orders_num): u128;

        /// 保证金收入比例
        /// 当代购者违规会被扣除交易设置的保证金，这个额外的收入会按MarginIncomeRatio计算一部分发送给ExtraIncomeEarner，剩余的发送给消费者。
        pub MarginIncomeRatio get(fn get_margin_income_ratio): (u8, u8);

        /// 小费收入比例
        /// 当代购交易单完成后，小费收入会按TipIncomeRatio计算一部分发送给ExtraIncomeEarner，剩余的发送给消费者。
        pub TipIncomeRatio get(fn get_tip_income_ratio): (u8, u8);

        /// 代购交易订单表
        /// 纪录消费者的申请退货的订单信息。
        pub CommissionedShoppingOrders get(fn get_commissioned_shopping_orders):
            map hasher(identity) T::Hash => Option<OrderInfoOf<T>>;

        /// 退货订单表
        /// 纪录消费者的申请退货的订单信息。
        pub ReturningOrders get(fn get_returning_orders):
            double_map hasher(identity) T::Hash,
            hasher(identity) T::Hash => Option<ReturnInfoOf<T>>;

        /// 各类货币累计成交的金额
        /// 纪录每种货币的购物总金额。
        pub TotalShoppingAmountOfCurrenies get(fn get_total_shopping_amount_of_currenies): map hasher(twox_64_concat) T::AssetId => BalanceOf<T>;

        /// 交易申诉
        /// 纪录申请关联的账户代购交易单。
        pub AppealOf get(fn get_appeal_of): map hasher(identity) T::Hash => Option<(T::AccountId, T::Hash)>;



    }
}

// Pallets use events to inform users when important changes are made.
// https://substrate.dev/docs/en/knowledgebase/runtime/events
decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as frame_system::Trait>::AccountId,
        Hash = <T as frame_system::Trait>::Hash,
        OrderInfo = OrderInfoOf<T>,
        ReturnInfo = ReturnInfoOf<T>,
    {
        /// ShoppingOrderUpdated 代购订单更新
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - order OrderInfo 订单信息
        ShoppingOrderUpdated(Hash, OrderInfo),

        /// ReturnOrderUpdated 退货订单更新
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - ext_return_hash Hash 外部链下订单系统的退货单哈希
        /// - return_order ReturnInfo 订单信息
        ReturnOrderUpdated(Hash, Hash, ReturnInfo),

        /// ClearShoppingOrder 清除已完成的代购订单
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        // - status OrderStatus 订单状态
        ClearShoppingOrder(Hash, OrderStatus),

        /// ClearCommodityReturn 清理已完成的退货单
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - ext_return_hash Hash 外部链下订单系统的退货单哈希
        /// - status ReturnStatus 退货单状态
        ClearCommodityReturn(Hash, Hash, ReturnStatus),

        /// Appeal
        /// - prosecutor AccountId 原告人
        /// - defendant AccountId 被告人
        /// - owner AccountId 订单拥有者
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - case_hash Hash 申诉的案件哈希
        Appeal(AccountId, AccountId, AccountId, Hash, Hash),

        /// RevokeAppeal
        /// - prosecutor AccountId 原告人
        /// - owner AccountId 订单拥有者
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - case_hash Hash 申诉的案件哈希
        RevokeAppeal(AccountId, AccountId, Hash, Hash),
    }
);

// Errors inform users that something went wrong.
decl_error! {
    pub enum Error for Module<T: Trait> {
        /// Error names should be descriptive.
        NoneValue,
        /// Errors should have helpful documentation associated with them.
        ValueOverflow,
        /// 账户余额不足。
        InsufficientBalance,
        /// 外部订单已存在
        ShoppingOrderIsExisted,
        /// 外部订单不存在。
        ShoppingOrderIsNotExisted,
        /// 退货单已存在
        ReturnedOrderIsExisted,
        /// 退货单不存在。
        ReturnedOrderIsNotExisted,
        /// 必要的保证金不足。
        InsufficientRequiredDeposit,
        /// 必要的信用值不足。
        InsufficientRequiredCredit,
        /// 操作不允许。
        OperationIsNotAllowed,
        /// 订单没有代购者接受
        NoShoppingAgentAccepted,
        /// 不必操作。
        NoNeedToOperate,
        /// 退货金额超过了可以支付的金额
        ReturnAmountIsOverPayAmount,
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call where origin: T::Origin {

        type Error = Error<T>;

        fn deposit_event() = default;

        const ShoppingTimeLimit: T::BlockNumber = T::ShoppingTimeLimit::get();

        const ReceivingTimeLimit: T::BlockNumber = T::ReceivingTimeLimit::get();

        const ResponseReturnTimeLimit: T::BlockNumber = T::ResponseReturnTimeLimit::get();

        const AcceptReturnTimeLimit: T::BlockNumber = T::AcceptReturnTimeLimit::get();


        /// apply_shopping_order 发布代购交易单
        /// 所有账户都可以发布代购交易单。
        /// - origin AccountId 消费者地址
        /// - payment_amount Balance 支付金额
        /// - tip Balance 小费
        /// - currency AssetId 支付币种
        /// - required_deposit Balance 保证金要求
        /// - required_credit u64 信用值要求
        /// - version u32 交易单版本
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn apply_shopping_order(
            origin,
            #[compact] payment_amount: BalanceOf<T>,
            #[compact] tip: BalanceOf<T>,
            #[compact] currency: T::AssetId,
            #[compact] required_deposit: BalanceOf<T>,
            #[compact] required_credit: u64,
            #[compact] version: u32,
            ext_order_hash: T::Hash
        ) -> dispatch::DispatchResult {

            let consumer = ensure_signed(origin)?;

            //检查订单是否重复提交
            ensure!(!CommissionedShoppingOrders::<T>::contains_key(ext_order_hash), Error::<T>::ShoppingOrderIsExisted);

            let now = <frame_system::Module<T>>::block_number();
            // 计算要充值到订单账户的金额
            let deposit = payment_amount.checked_add(&tip).ok_or(Error::<T>::ValueOverflow)?;
            T::Currency::transfer(
                &consumer,
                &Self::order_account_id(ext_order_hash),
                Some(currency),
                deposit,
                ExistenceRequirement::KeepAlive,
            )?;

            let order = OrderInfo {
                consumer: consumer.clone(),
                shopping_agent: None,
                payment_amount: payment_amount,
                tip: tip,
                return_amount: BalanceOf::<T>::default(),
                currency: currency,
                status: OrderStatus::Pending,
                create_time: now,
                required_deposit: required_deposit,
                required_credit: required_credit,
                shipping_hash: None,
                is_return: false,
                version: version,
                accept_time: T::BlockNumber::default(),
                shipping_time: T::BlockNumber::default(),
                end_time: T::BlockNumber::default(),
            };

            // 插入纪录
            CommissionedShoppingOrders::<T>::insert(&ext_order_hash, order.clone());

            Self::deposit_event(RawEvent::ShoppingOrderUpdated(ext_order_hash, order));


            Ok(())
        }

        /// close_shopping_order 关闭代购交易单
        /// 消费者手动关闭订单。
        /// - origin AccountId 消费者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn close_shopping_order(origin, ext_order_hash: T::Hash) -> dispatch::DispatchResult {
            // 消费者账户
            let who = ensure_signed(origin)?;
            // 订单账户
            let order_account = Self::order_account_id(ext_order_hash);
            // 读取订单，不存在返回错误
            let order = CommissionedShoppingOrders::<T>::get(&ext_order_hash).ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;
            // 验证订单状态
            ensure!(order.status == OrderStatus::Pending, Error::<T>::OperationIsNotAllowed);
            // 计算退回给消费者的金额
            let deposit = order.payment_amount.checked_add(&order.tip).ok_or(Error::<T>::ValueOverflow)?;

            //赎回资金给订单拥有者
            T::Currency::transfer(
                &order_account,
                &who,
                Some(order.currency),
                deposit,
                ExistenceRequirement::KeepAlive,
            )?;

            // 删除订单
            CommissionedShoppingOrders::<T>::remove(&ext_order_hash);

            Self::deposit_event(RawEvent::ClearShoppingOrder(ext_order_hash, OrderStatus::Closed));

            Ok(())
        }

        /// accept_shopping_order 接受代购交易单
        /// 所有账户都可以接受代购交易单，成为代购者。
        /// - origin AccountId 代购者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn accept_shopping_order(origin, ext_order_hash: T::Hash) -> dispatch::DispatchResult {
            // 代购者账户
            let who = ensure_signed(origin)?;
            let now = <frame_system::Module<T>>::block_number();
            // 读取订单，不存在返回错误
            let mut order = CommissionedShoppingOrders::<T>::get(&ext_order_hash).ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;
            // 验证订单状态
            ensure!(order.status == OrderStatus::Pending, Error::<T>::OperationIsNotAllowed);
            // 订单还没有代购者接单
            ensure!(order.shopping_agent == None, Error::<T>::OperationIsNotAllowed);

            // 查询代购者余额
            let shopping_agent_balance = T::Currency::free_balance(&who, Some(order.currency));

            // 判断代购者保证金是否满足订单要求
            ensure!(shopping_agent_balance >= order.required_deposit, Error::<T>::InsufficientRequiredDeposit);

            T::Currency::transfer(
                &who,
                &Self::order_account_id(ext_order_hash),
                Some(order.currency),
                order.required_deposit,
                ExistenceRequirement::KeepAlive,
            )?;

            //TODO: 判断代购者信用值是否满足订单要求

            // 更新订单信息
            order.status = OrderStatus::Accepted;
            order.shopping_agent = Some(who.clone());
            order.accept_time = now;
            CommissionedShoppingOrders::<T>::insert(&ext_order_hash, order.clone());

            Self::deposit_event(RawEvent::ShoppingOrderUpdated(ext_order_hash, order));

            Ok(())
        }

        /// do_commodity_shipping 提交商品发货信息
        /// 代购者完成电商平台购物，提交商品发货信息
        /// - origin AccountId 代购者地址
        /// - consumer AccountId 消费者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - shipping_hash Hash 发货运单证明
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn do_commodity_shipping(origin, ext_order_hash: T::Hash, shipping_hash: T::Hash) -> dispatch::DispatchResult {

            // 代购者账户
            let who = ensure_signed(origin)?;
            let now = <frame_system::Module<T>>::block_number();
            // 读取订单，不存在返回错误
            let mut order = CommissionedShoppingOrders::<T>::get(&ext_order_hash).ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;

            // 验证订单状态
            ensure!(order.status == OrderStatus::Accepted, Error::<T>::OperationIsNotAllowed);
            // 订单代购者是否origin
            ensure!(order.shopping_agent == Some(who.clone()), Error::<T>::OperationIsNotAllowed);

            // 更新订单信息
            order.status = OrderStatus::Shipping;
            order.shipping_hash = Some(shipping_hash);
            order.shipping_time = now;
            CommissionedShoppingOrders::<T>::insert(&ext_order_hash, order.clone());

            Self::deposit_event(RawEvent::ShoppingOrderUpdated(ext_order_hash, order));

            Ok(())
        }

        /// confirm_commodity_received 确认商品收货
        /// 消费者收到商品，提交确认到货。
        /// - origin AccountId 消费者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn confirm_commodity_received(origin, ext_order_hash: T::Hash) -> dispatch::DispatchResult {

            // 消费者账户
            let who = ensure_signed(origin)?;
            // 读取订单，不存在返回错误
            let mut order = CommissionedShoppingOrders::<T>::get(&ext_order_hash).ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;
            // 验证订单状态
            ensure!(order.status == OrderStatus::Shipping || order.status == OrderStatus::Returning, Error::<T>::OperationIsNotAllowed);
            // 订单消费者是否origin
            ensure!(order.consumer == who.clone(), Error::<T>::OperationIsNotAllowed);

            // 如果订单状态为Returning，先清理所有已过期的退货单
            if order.status == OrderStatus::Returning {
                Self::handle_returning_order(&ext_order_hash, &mut order);
            }

            //  如果订单转变为shipping，继续处理确认收货
            if order.status == OrderStatus::Shipping {
                Self::order_change_received(&ext_order_hash, &mut order)?;
            }

            Ok(())
        }

        /// clear_shopping_order 清理订单
        /// 该操作将对一些在某阶段超时的订单转换为下一阶段，直到最后阶段系统会对订单删除清理。
        /// - origin AccountId 任何账户地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        #[weight = 10_000]
        pub fn clear_shopping_order(origin, ext_order_hash: T::Hash) -> dispatch::DispatchResult {
            ensure_none(origin)?;
            // 读取订单，不存在返回错误
            let mut order = CommissionedShoppingOrders::<T>::get(&ext_order_hash).ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;
            let is_timeout = Self::handle_order_timeout(&ext_order_hash, &mut order)?;
            // 如果没有超时处理操作，返回错误，不需要提交交易
            ensure!(is_timeout, Error::<T>::NoNeedToOperate);
            Ok(())
        }

        /// apply_commodity_return 申请退货
        /// 消费者申请商品退货
        /// - origin AccountId 消费者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - ext_return_hash Hash 外部链下订单系统的退货单哈希
        /// - return_amount Balance 退货金额
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn apply_commodity_return(origin, ext_order_hash: T::Hash, ext_return_hash: T::Hash, return_amount: BalanceOf<T>) -> dispatch::DispatchResult {

            // 消费者账户
            let who = ensure_signed(origin)?;
            // 读取订单，不存在返回错误
            let mut order = CommissionedShoppingOrders::<T>::get(&ext_order_hash).ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;

            // 验证订单状态
            ensure!(order.status == OrderStatus::Shipping || order.status == OrderStatus::Returning, Error::<T>::OperationIsNotAllowed);
            // 订单消费者是否origin
            ensure!(order.consumer == who.clone(), Error::<T>::OperationIsNotAllowed);
            // 退货金额不能超过订单实际支付的金额
            ensure!(return_amount <= order.payment_amount, Error::<T>::ReturnAmountIsOverPayAmount);
            // 检查ext_return_hash是否已存在关联的退货单
            ensure!(!ReturningOrders::<T>::contains_key(&ext_order_hash, &ext_return_hash), Error::<T>::ReturnedOrderIsExisted);

            let now = <frame_system::Module<T>>::block_number();
            let consumer = order.consumer.clone();
            let shopping_agent = order.shopping_agent.clone().ok_or(Error::<T>::NoShoppingAgentAccepted)?;

            // 新增退货纪录
            let return_order = ReturnInfo {
                consumer: consumer,
                shopping_agent: shopping_agent,
                return_amount: return_amount,
                create_time: now,
                status: ReturnStatus::Applied,
                shipping_hash: None,
                accept_time: T::BlockNumber::default(),
                shipping_time: T::BlockNumber::default(),
                end_time: T::BlockNumber::default(),
                version: 0,
            };

            // 插入退货单
            ReturningOrders::<T>::insert(&ext_order_hash, &ext_return_hash, return_order.clone());
            Self::deposit_event(RawEvent::ReturnOrderUpdated(ext_order_hash, ext_return_hash, return_order));

            // 更新订单信息
            order.status = OrderStatus::Returning;
            CommissionedShoppingOrders::<T>::insert(&ext_order_hash, order.clone());
            Self::deposit_event(RawEvent::ShoppingOrderUpdated(ext_order_hash, order));

            Ok(())
        }

        /// cancel_commodity_return
        /// - origin AccountId 消费者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - ext_return_hash Hash 外部链下订单系统的退货单哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        fn cancel_commodity_return(origin, ext_order_hash: T::Hash, ext_return_hash: T::Hash) -> dispatch::DispatchResult {

            // 消费者账户
            let who = ensure_signed(origin)?;
            // 查询退货单
            let return_order = ReturningOrders::<T>::get(&ext_order_hash, &ext_return_hash).ok_or(Error::<T>::ReturnedOrderIsNotExisted)?;

            // 订单消费者是否origin
            ensure!(return_order.consumer == who.clone(), Error::<T>::OperationIsNotAllowed);
            // 验证订单状态
            ensure!(return_order.status == ReturnStatus::Applied, Error::<T>::OperationIsNotAllowed);

            // 删除订单
            ReturningOrders::<T>::remove(ext_order_hash, ext_return_hash);

            Self::deposit_event(RawEvent::ClearCommodityReturn(
                ext_order_hash.to_owned(),
                ext_return_hash.to_owned(),
                ReturnStatus::Closed,
            ));
            Ok(())
        }

        /// response_commodity_return 回应退货申请
        /// 代购者回应退货申请
        /// - origin AccountId 代购者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - ext_return_hash Hash 外部链下订单系统的退货单哈希
        /// - is_accept bool 是否接受
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn response_commodity_return(origin, ext_order_hash: T::Hash, ext_return_hash: T::Hash, is_accept: bool) -> dispatch::DispatchResult {

            // 代购者账户
            let who = ensure_signed(origin)?;
            // 查询退货单
            let mut return_order = ReturningOrders::<T>::get(&ext_order_hash, &ext_return_hash).ok_or(Error::<T>::ReturnedOrderIsNotExisted)?;

            // 订单代购者是否origin
            ensure!(return_order.shopping_agent == who.clone(), Error::<T>::OperationIsNotAllowed);
            // 验证订单状态
            ensure!(return_order.status == ReturnStatus::Applied, Error::<T>::OperationIsNotAllowed);

            let now = <frame_system::Module<T>>::block_number();

            if is_accept {
                // 更新订单信息
                return_order.status = ReturnStatus::Accepted;
                return_order.accept_time = now;
                ReturningOrders::<T>::insert(&ext_order_hash, &ext_return_hash, return_order.clone());
            } else {
                // 更新订单信息
                return_order.status = ReturnStatus::Refused;
                return_order.accept_time = now;
                ReturningOrders::<T>::insert(&ext_order_hash, &ext_return_hash, return_order.clone());
            }

            Self::deposit_event(RawEvent::ReturnOrderUpdated(ext_order_hash, ext_return_hash, return_order));

            Ok(())
        }

        /// do_commodity_returning 提交退货商品的运单信息
        /// 消费者执行商品退货，提交运单信息。
        /// - origin AccountId 消费者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - ext_return_hash Hash 外部链下订单系统的退货单哈希
        /// - shipping_hash Hash 发货运单证明
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn do_commodity_returning(origin, ext_order_hash: T::Hash, ext_return_hash: T::Hash, shipping_hash: T::Hash) -> dispatch::DispatchResult {

            // 消费者账户
            let who = ensure_signed(origin)?;
            // 查询退货单
            let mut return_order = ReturningOrders::<T>::get(&ext_order_hash, &ext_return_hash).ok_or(Error::<T>::ReturnedOrderIsNotExisted)?;

            // 订单消费者是否origin
            ensure!(return_order.consumer == who.clone(), Error::<T>::OperationIsNotAllowed);
            // 验证订单状态
            ensure!(return_order.status == ReturnStatus::Accepted, Error::<T>::OperationIsNotAllowed);

            let now = <frame_system::Module<T>>::block_number();

            // 更新订单信息
            return_order.status = ReturnStatus::Shipping;
            return_order.shipping_hash = Some(shipping_hash);
            return_order.shipping_time = now;
            ReturningOrders::<T>::insert(&ext_order_hash, &ext_return_hash, return_order.clone());

            Self::deposit_event(RawEvent::ReturnOrderUpdated(ext_order_hash, ext_return_hash, return_order));

            Ok(())
        }


        /// confirm_commodity_returned 确认退货完成
        /// 代购者确认商家收到退货。
        /// - origin AccountId 代购者地址
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - ext_return_hash Hash 外部链下订单系统的退货单哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn confirm_commodity_returned(origin, ext_order_hash: T::Hash, ext_return_hash: T::Hash) -> dispatch::DispatchResult {

            // 代购者账户
            let who = ensure_signed(origin)?;
            // 查询退货单
            let mut return_order = ReturningOrders::<T>::get(&ext_order_hash, &ext_return_hash).ok_or(Error::<T>::ReturnedOrderIsNotExisted)?;

            // 订单代购者是否origin
            ensure!(return_order.shopping_agent == who.clone(), Error::<T>::OperationIsNotAllowed);
            // 验证订单状态
            ensure!(return_order.status == ReturnStatus::Shipping, Error::<T>::OperationIsNotAllowed);

            Self::handle_commodity_returned(&ext_order_hash, &ext_return_hash, &mut return_order)?;

            Ok(())
        }

        /// appeal 申诉
        /// 代购交易发生纠纷，任一方可以提交申诉。
        /// - origin AccountId 申诉者地址
        /// - owner AccountId 订单拥有者
        /// - ext_order_hash Hash 外部链下订单系统的订单哈希
        /// - case_hash Hash 申诉的案件哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn appeal(origin, owner: T::AccountId, ext_order_hash: T::Hash, case_hash: T::Hash) -> dispatch::DispatchResult {
            // TODO:
            Ok(())
        }


        /// revoke_appeal 撤销申诉
        /// 原告账户可以撤销申诉。
        /// - origin AccountId 原告账户
        /// - case_hash Hash 案件哈希
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn revoke_appeal(origin, case_hash: T::Hash) -> dispatch::DispatchResult {
            // TODO:
            Ok(())
        }

        /// 区块完成后执行
        fn on_finalize(n: T::BlockNumber) {


        }

    }
}

impl<T: Trait> Module<T> {
    /// The account ID of the order.
    ///
    /// This actually does computation. If you need to keep using it, then make sure you cache the
    /// value and only call this once.
    pub fn order_account_id(hash: T::Hash) -> T::AccountId {
        PALLET_ID.into_sub_account(hash)
    }

    /// handle_order_timeout 处理订单不同状态下超时的情况
    /// - who T::AccountId 操作者
    /// - order OrderInfo 订单
    pub fn handle_order_timeout(
        ext_order_hash: &T::Hash,
        order: &mut OrderInfoOf<T>,
    ) -> Result<bool, sp_runtime::DispatchError> {
        //: 处理订单不同状态下超时的情况

        let now = <frame_system::Module<T>>::block_number();
        let mut is_timeout = false;
        match order.status {
            OrderStatus::Accepted => {
                let time_limit = T::ShoppingTimeLimit::get();
                if now > time_limit + order.accept_time {
                    // 代购者已接受订单，但代购者发货超时
                    // 订单转为失败，解锁订单资金给消费者
                    Self::order_change_failed(ext_order_hash, order)?;
                    is_timeout = true;
                }
            }
            OrderStatus::Shipping => {
                let time_limit = T::ReceivingTimeLimit::get();
                if now > time_limit + order.shipping_time {
                    // 代购者已发货，但消费者确认到货超时
                    // 订单自动确认到货
                    Self::order_change_received(ext_order_hash, order)?;
                    is_timeout = true;
                }
            }
            OrderStatus::Received | OrderStatus::Failed => {
                let time_limit = T::ClearTimeLimit::get();
                if now > time_limit + order.end_time {
                    // 订单已确认，超过清理时限，系统删除订单
                    Self::delete_order(ext_order_hash);
                    is_timeout = true;
                }
            }
            OrderStatus::Returning => {
                // 处理超时的退货单
                let mut return_start: T::BlockNumber = Zero::zero();
                let mut all_passed: bool = true;
                ReturningOrders::<T>::iter_prefix(ext_order_hash).for_each(
                    |(ext_return_hash, mut return_order)| {
                        if return_order.create_time > return_start {
                            return_start = return_order.create_time;
                        }

                        if let Ok(is_timeout_of_return) = Self::handle_return_order_timeout(
                            ext_order_hash,
                            &ext_return_hash,
                            &mut return_order,
                        ) {
                            if is_timeout_of_return {
                                is_timeout = is_timeout_of_return
                            }
                        } else {
                            all_passed = false;
                        }
                    },
                );

                // 处理没有失败
                if all_passed {
                    // 如果检查处理后的退货单数量为0，恢复OrderStatus为Shipping，重新计算剩余的shipping_time
                    let count = ReturningOrders::<T>::iter_prefix(ext_order_hash).count();
                    if count == 0 {
                        // 保存原订单，重新计算shipping_time
                        order.shipping_time = now - return_start + order.shipping_time;
                        order.status = OrderStatus::Shipping;
                        CommissionedShoppingOrders::<T>::insert(&ext_order_hash, order.clone());
                        Self::deposit_event(RawEvent::ShoppingOrderUpdated(
                            ext_order_hash.to_owned(),
                            order.to_owned(),
                        ));
                        is_timeout = true;
                    }
                }
            }
            _ => (),
        }

        Ok(is_timeout)
    }

    /// handle_returning_order 处理退货中的订单
    /// - who T::AccountId 操作者
    /// - order OrderInfo 订单
    pub fn handle_returning_order(ext_order_hash: &T::Hash, order: &mut OrderInfoOf<T>) {
        // 处理超时的退货单
        let mut return_start: T::BlockNumber = Zero::zero();
        let now = <frame_system::Module<T>>::block_number();
        ReturningOrders::<T>::iter_prefix(ext_order_hash).for_each(
            |(ext_return_hash, return_order)| {
                if return_order.create_time > return_start {
                    return_start = return_order.create_time;
                }

                match return_order.status {

                    ReturnStatus::Refused | ReturnStatus::Returned | ReturnStatus::NoResponse => {
                        // 退货单已完结，可以立即删除订单
                        Self::delete_return_order(ext_order_hash, &ext_return_hash);
                    }
                    _ => (),
                }
            },
        );

        // 如果检查处理后的退货单数量为0，恢复OrderStatus为Shipping，重新计算剩余的shipping_time
        let count = ReturningOrders::<T>::iter_prefix(ext_order_hash).count();
        if count == 0 {
            // 保存原订单，重新计算shipping_time
            order.shipping_time = now - return_start + order.shipping_time;
            order.status = OrderStatus::Shipping;
        }
    }

    /// delete_order 删除订单
    /// - ext_order_hash T::Hash 订单哈希
    pub fn delete_order(ext_order_hash: &T::Hash) {
        // 订单已确认，超过清理时限，系统删除订单
        CommissionedShoppingOrders::<T>::remove(ext_order_hash);
        Self::deposit_event(RawEvent::ClearShoppingOrder(
            ext_order_hash.to_owned(),
            OrderStatus::Archived,
        ));
    }

    /// order_change_received 确认订单
    /// - ext_order_hash T::Hash 订单哈希
    /// - order &mut OrderInfoOf<T> 可修改的订单信息
    pub fn order_change_received(
        ext_order_hash: &T::Hash,
        order: &mut OrderInfoOf<T>,
    ) -> dispatch::DispatchResult {
        let OrderInfo {
            currency,
            payment_amount,
            tip,
            required_deposit,
            shopping_agent,
            ..
        } = order.clone();

        let now = <frame_system::Module<T>>::block_number();

        let shopping_agent = shopping_agent.ok_or(Error::<T>::NoShoppingAgentAccepted)?;

        //转账支付金额，小费，保证金给代购者
        let mut total_pay = payment_amount
            .checked_add(&tip)
            .ok_or(Error::<T>::ValueOverflow)?;
        total_pay = total_pay
            .checked_add(&required_deposit)
            .ok_or(Error::<T>::ValueOverflow)?;

        // 订单账户
        let order_account = Self::order_account_id(ext_order_hash.to_owned());

        //支付总金额给代购者
        T::Currency::transfer(
            &order_account,
            &shopping_agent,
            Some(currency),
            total_pay,
            ExistenceRequirement::KeepAlive,
        )?;

        // 更新订单信息
        order.status = OrderStatus::Received;
        order.end_time = now;
        CommissionedShoppingOrders::<T>::insert(ext_order_hash, order.clone());

        Self::deposit_event(RawEvent::ShoppingOrderUpdated(
            ext_order_hash.to_owned(),
            order.to_owned(),
        ));

        return Ok(());
    }

    /// order_change_failed 订单转为失败
    /// - ext_order_hash T::Hash 订单哈希
    /// - order &mut OrderInfoOf<T> 可修改的订单信息
    pub fn order_change_failed(
        ext_order_hash: &T::Hash,
        order: &mut OrderInfoOf<T>,
    ) -> dispatch::DispatchResult {
        let OrderInfo {
            consumer,
            currency,
            payment_amount,
            tip,
            required_deposit,
            ..
        } = order.clone();

        let now = <frame_system::Module<T>>::block_number();

        //转账支付金额，小费，保证金给消费者
        let mut total_pay = payment_amount
            .checked_add(&tip)
            .ok_or(Error::<T>::ValueOverflow)?;
        total_pay = total_pay
            .checked_add(&required_deposit)
            .ok_or(Error::<T>::ValueOverflow)?;

        // 订单账户
        let order_account = Self::order_account_id(ext_order_hash.to_owned());

        //赎回资金给订单拥有者
        T::Currency::transfer(
            &order_account,
            &consumer,
            Some(currency),
            total_pay,
            ExistenceRequirement::KeepAlive,
        )?;

        // 更新订单信息
        order.status = OrderStatus::Failed;
        order.end_time = now;
        CommissionedShoppingOrders::<T>::insert(ext_order_hash, order.clone());

        Self::deposit_event(RawEvent::ShoppingOrderUpdated(
            ext_order_hash.to_owned(),
            order.to_owned(),
        ));

        Ok(())
    }

    /// handle_return_order_timeout 处理退货订单不同状态下超时的情况
    /// - who T::AccountId 操作者
    /// - order OrderInfo 订单
    pub fn handle_return_order_timeout(
        ext_order_hash: &T::Hash,
        ext_return_hash: &T::Hash,
        return_order: &mut ReturnInfoOf<T>,
    ) -> Result<bool, sp_runtime::DispatchError> {
        //: 处理订单不同状态下超时的情况

        let now = <frame_system::Module<T>>::block_number();
        let mut is_timeout = false;
        match return_order.status {
            ReturnStatus::Applied => {
                let time_limit = T::ResponseReturnTimeLimit::get();
                if now > time_limit + return_order.create_time {
                    // 当消费者申请退货，但代购者超过了回应退货限制时间，订单自动关闭，代购者的保证金支付给消费者，解锁商品金额退回消费者。
                    Self::return_order_no_response(ext_order_hash, ext_return_hash, return_order)?;
                    is_timeout = true;
                }
            }
            ReturnStatus::Accepted => {
                let time_limit = T::AcceptReturnTimeLimit::get();
                if now > time_limit + return_order.accept_time {
                    // 代购者已接受订单，但消费者发货超时，订单转为关闭。
                    // Self::handle_commodity_returned(ext_order_hash, ext_return_hash, return_order)?;
                    Self::delete_return_order(ext_order_hash, ext_return_hash);
                    is_timeout = true;
                }
            }
            ReturnStatus::Shipping => {
                let time_limit = T::ReceivingTimeLimit::get();
                if now > time_limit + return_order.shipping_time {
                    // 代购者已发货，但消费者确认到货超时
                    // 订单自动确认到货
                    Self::handle_commodity_returned(ext_order_hash, ext_return_hash, return_order)?;
                    is_timeout = true;
                }
            }
            ReturnStatus::Refused | ReturnStatus::Returned | ReturnStatus::NoResponse => {
                let time_limit = T::ClearTimeLimit::get();
                if now > time_limit + return_order.end_time {
                    // 订单已确认，超过清理时限，系统删除订单
                    Self::delete_return_order(ext_order_hash, ext_return_hash);
                    is_timeout = true;
                }
            }
            _ => (),
        }

        Ok(is_timeout)
    }

    pub fn handle_commodity_returned(
        ext_order_hash: &T::Hash,
        ext_return_hash: &T::Hash,
        return_order: &mut ReturnInfoOf<T>,
    ) -> dispatch::DispatchResult {
        // 读取订单，不存在返回错误
        let mut order = CommissionedShoppingOrders::<T>::get(ext_order_hash)
            .ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;

        // 退货金额转账给消费者
        // 订单账户
        let order_account = Self::order_account_id(ext_order_hash.to_owned());

        // 更新原订单的金额
        order.payment_amount = order
            .payment_amount
            .checked_sub(&return_order.return_amount)
            .ok_or(Error::<T>::ValueOverflow)?;
        order.return_amount = order
            .return_amount
            .checked_add(&return_order.return_amount)
            .ok_or(Error::<T>::ValueOverflow)?;

        //赎回资金给订单拥有者
        T::Currency::transfer(
            &order_account,
            &return_order.consumer,
            Some(order.currency),
            return_order.return_amount,
            ExistenceRequirement::KeepAlive,
        )?;

        // 更新退货订单信息
        return_order.status = ReturnStatus::Returned;
        ReturningOrders::<T>::insert(&ext_order_hash, &ext_return_hash, return_order.clone());

        // 保存原订单
        CommissionedShoppingOrders::<T>::insert(&ext_order_hash, order);

        Self::deposit_event(RawEvent::ReturnOrderUpdated(
            ext_order_hash.to_owned(),
            ext_return_hash.to_owned(),
            return_order.to_owned(),
        ));

        Ok(())
    }

    /// return_order_no_response 代购者没有回应退货
    /// - ext_order_hash &T::Hash 订单哈希
    /// - ext_return_hash: &T::Hash,
    /// - return_order &mut ReturnInfoOf<T> 可修改的退货单信息
    pub fn return_order_no_response(
        ext_order_hash: &T::Hash,
        ext_return_hash: &T::Hash,
        return_order: &mut ReturnInfoOf<T>,
    ) -> dispatch::DispatchResult {
        // 读取订单，不存在返回错误
        let mut order = CommissionedShoppingOrders::<T>::get(ext_order_hash)
            .ok_or(Error::<T>::ShoppingOrderIsNotExisted)?;

        // 退货金额转账给消费者
        // 订单账户
        let order_account = Self::order_account_id(ext_order_hash.to_owned());

        // 更新原订单的金额
        order.payment_amount = order
            .payment_amount
            .checked_sub(&return_order.return_amount)
            .ok_or(Error::<T>::ValueOverflow)?;
        order.return_amount = order
            .return_amount
            .checked_add(&return_order.return_amount)
            .ok_or(Error::<T>::ValueOverflow)?;

        //赎回资金给订单拥有者
        T::Currency::transfer(
            &order_account,
            &return_order.consumer,
            Some(order.currency),
            return_order.return_amount,
            ExistenceRequirement::KeepAlive,
        )?;

        // 更新退货订单信息
        return_order.status = ReturnStatus::NoResponse;
        ReturningOrders::<T>::insert(&ext_order_hash, &ext_return_hash, return_order.clone());

        // 保存原订单
        CommissionedShoppingOrders::<T>::insert(&ext_order_hash, order);

        Self::deposit_event(RawEvent::ReturnOrderUpdated(
            ext_order_hash.to_owned(),
            ext_return_hash.to_owned(),
            return_order.to_owned(),
        ));

        Ok(())
    }

    /// delete_return_order 删除退换订单
    /// - ext_order_hash T::Hash 订单哈希
    /// - ext_return_hash T::Hash 退货单哈希
    pub fn delete_return_order(ext_order_hash: &T::Hash, ext_return_hash: &T::Hash) {
        // 订单已确认，超过清理时限，系统删除订单
        ReturningOrders::<T>::remove(ext_order_hash, ext_return_hash);

        Self::deposit_event(RawEvent::ClearCommodityReturn(
            ext_order_hash.to_owned(),
            ext_return_hash.to_owned(),
            ReturnStatus::Archived,
        ));
    }
}

/// 支持未签名交易
impl<T: Trait> frame_support::unsigned::ValidateUnsigned for Module<T> {
    type Call = Call<T>;

    fn validate_unsigned(_source: TransactionSource, call: &Self::Call) -> TransactionValidity {
        const UNSIGNED_TXS_PRIORITY: u64 = 100;
        let valid_tx = |provide| {
            ValidTransaction::with_tag_prefix("commissioned-shopping")
                .priority(UNSIGNED_TXS_PRIORITY)
                .and_provides([&provide])
                .longevity(TransactionLongevity::max_value())
                .propagate(true)
                .build()
        };

        match call {
            Call::clear_shopping_order(ref ext_order_hash) => {
                ensure!(
                    CommissionedShoppingOrders::<T>::contains_key(ext_order_hash),
                    InvalidTransaction::Custom(Error::<T>::ShoppingOrderIsNotExisted.as_u8())
                );
                let now = <frame_system::Module<T>>::block_number();
                valid_tx((ext_order_hash, now))
            }
            _ => InvalidTransaction::Call.into(),
        }
    }
}
