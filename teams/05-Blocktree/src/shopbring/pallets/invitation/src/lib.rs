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

// use std::convert::TryFrom;

use codec::{Decode, Encode};
use frame_support::{
    decl_error, decl_event, decl_module, decl_storage, dispatch, ensure,
    traits::{
        Currency, ExistenceRequirement, Get, ReservableCurrency, WithdrawReason, WithdrawReasons,
    },
    unsigned::{TransactionSource, TransactionValidity},
};
use frame_system::{ensure_none, ensure_signed};
use primitives::{self, Byte32};
use sp_core::ed25519;
use sp_runtime::{
    traits::{AccountIdConversion, CheckedMul, Verify, Zero},
    transaction_validity::{InvalidTransaction, TransactionLongevity, ValidTransaction},
    ModuleId, RuntimeDebug,
};
use sp_std::borrow::ToOwned;
use sp_std::prelude::*;

mod mock;
mod tests;

/// PALLET_ID
const PALLET_ID: ModuleId = ModuleId(*b"inviters");

type BalanceOf<T> =
    <<T as Trait>::Currency as Currency<<T as frame_system::Trait>::AccountId>>::Balance;
pub type InvitationIndex = u64;

/// Configure the pallet by specifying the parameters and types on which it depends.
pub trait Trait: frame_system::Trait {
    /// Because this pallet emits events, it depends on the runtime's definition of an event.
    type Event: From<Event<Self>> + Into<<Self as frame_system::Trait>::Event>;

    /// 货币类型
    /// 系统支持的货币
    type Currency: ReservableCurrency<Self::AccountId>;

    /// 最低单位赠金数
    /// 单位赠金数可由邀请人自由设置，但不能低于系统要求的最低值。
    type MinUnitBonus: Get<BalanceOf<Self>>;
}

/// 邀请人信息
/// 存储已登记的邀请人信息
#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug)]
pub struct InvitationInfo<Balance> {
    /// 邀请函校验公钥
    pub invitation_pk: primitives::Byte32,
    /// 单笔赠金数`BPG`
    pub unit_bonus: Balance,
    /// 最大邀请人数
    pub max_invitees: u32,
    /// 冻结的金额
    pub frozen_amount: Balance,
    /// 已邀请人数
    pub num_of_invited: u32,
    /// 邀请存储下标
    pub invitation_index: InvitationIndex,
}

decl_storage! {

    trait Store for Module<T: Trait> as Invitation {

        /// 全部邀请人
        /// 当前全网络注册的邀请人
        pub TotalInviters get(fn get_total_inviters): u64;

        /// 已发放的赠金
        /// 全网络累积邀请人发放的赠金总数
        pub TotalDistributedBonus get(fn get_total_distributed_bonus): BalanceOf<T>;

        /// 邀请人登记表
        /// 邀请人绑定其邀请人登记信息。
        pub InviterRegistration get(fn get_inviter_registration): map hasher(twox_64_concat) T::AccountId => Option<InvitationInfo<BalanceOf<T>>>;

        /// 邀请人关系表
        /// 被邀请绑定其上级邀请人的索引表
        pub InviterRelationship get(fn get_inviter_relationship): map hasher(twox_64_concat) T::AccountId => Option<T::AccountId>;

        /// 邀请人标记
        /// 邀请人寄存的邀请数组
        InvitationCount get(fn fund_count): InvitationIndex;
    }
}

// Pallets use events to inform users when important changes are made.
// https://substrate.dev/docs/en/knowledgebase/runtime/events
decl_event!(
    pub enum Event<T>
    where
        AccountId = <T as frame_system::Trait>::AccountId,
        BlockNumber = <T as frame_system::Trait>::BlockNumber,
        Balance = BalanceOf<T>,
        Byte32 = primitives::Byte32,
        Byte64 = primitives::Byte64,
    {
        /// RegisterInviter
        /// - inviter AccountId 邀请人账户地址
        /// - invitation_pk byte32 邀请函校验公钥
        /// - unit_bonus Balance 单笔赠金数
        /// - max_invitees u32 最大邀请人数
        /// - frozen_amount Balance 冻结的金额
        RegisterInviter(AccountId, Byte32, Balance, u32, Balance),

        /// AcceptInvitation
        /// - invitee AccountId 受邀人账户地址
        /// - invitation_sig byte64 邀请函签名
        /// - inviter AccountId 邀请人账户地址
        /// - unit_bonus Balance 受邀人获得的赠金数
        AcceptInvitation(AccountId, Byte64, AccountId, Balance),

        /// EndInvitationPeriod
        /// - inviter AccountId 邀请人账户地址
        /// - reclaimed_bonus Balance 已回收的赠金
        /// - num_of_invited u32 已邀请人数
        /// - end BlockNumber 准确的结束时间
        EndInvitationPeriod(AccountId, Balance, u32, BlockNumber),
    }
);

// Errors inform users that something went wrong.
decl_error! {
    pub enum Error for Module<T: Trait> {
        /// Error names should be descriptive.
        NoneValue,
        /// Errors should have helpful documentation associated with them.
        ValueOverflow,
        /// 解码错误
        DecodeFailed,
        /// 账户余额不足。
        InsufficientBalance,
        /// 邀请人信息已存在，不可重复提交
        InvitationInfoIsExisted,
        /// 邀请人信息不存在
        InvitationInfoIsNotExisted,
        /// 操作不允许。
        OperationIsNotAllowed,
        /// 邀请人关系已存在
        InviterRelationshipIsExisted,
        /// 邀请人关系不存在
        InviterRelationshipIsNotExisted,
        /// 邀请签名校验失败
        InvitationSignatureIsInvalid,
    }
}

decl_module! {
    pub struct Module<T: Trait> for enum Call
    where origin: T::Origin {

        type Error = Error<T>;

        fn deposit_event() = default;

        const MinUnitBonus: BalanceOf<T> = T::MinUnitBonus::get();

        /// register_inviter
        /// - inviter origin 邀请人账户地址
        /// - invitation_pk byte32 邀请函校验公钥
        /// - unit_bonus Balance 单笔赠金数
        /// - max_invitees u64 最大邀请人数
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn register_inviter(origin, invitation_pk: Byte32, unit_bonus: BalanceOf<T>, max_invitees: u32) -> dispatch::DispatchResult {
            let who = ensure_signed(origin)?;

            // 检查邀请人信息是否已存在
            ensure!(!InviterRegistration::<T>::contains_key(&who), Error::<T>::InvitationInfoIsExisted);

            // 计算冻结的金额
            let frozen_amount = unit_bonus.checked_mul(&max_invitees.into()).ok_or(Error::<T>::ValueOverflow)?;

            // 获取index
            let index = InvitationCount::get();

            // 判断账户是否有足够余额，并进行锁定
            T::Currency::resolve_creating(&Self::invitation_account_id(index), T::Currency::withdraw(
                &who,
                frozen_amount,
                WithdrawReasons::from(WithdrawReason::Transfer),
                ExistenceRequirement::AllowDeath,
            )?);

            //登记邀请人信息
            let inviter = InvitationInfo {
                invitation_pk: invitation_pk,
                unit_bonus: unit_bonus,
                max_invitees: max_invitees,
                frozen_amount: frozen_amount,
                num_of_invited: 0,
                invitation_index:index,
            };

            let next_index = index.checked_add(1).ok_or(Error::<T>::ValueOverflow)?;

            InviterRegistration::<T>::insert(&who, inviter);
            InvitationCount::put(next_index);

            // Emit an event.
            Self::deposit_event(RawEvent::RegisterInviter(who, invitation_pk, unit_bonus, max_invitees, frozen_amount));

            Ok(())
        }


        /// accept_invitation
        /// 受邀人无需手续费，仅能执行一次
        /// - invitee origin 受邀人账户地址
        /// - invitation_sig byte64 邀请函签名
        /// - inviter AccountId 邀请人账户地址
        #[weight = 10_000]
        pub fn accept_invitation(origin, invitee: T::AccountId, invitation_sig: primitives::Byte64, inviter: T::AccountId) -> dispatch::DispatchResult {

            ensure_none(origin)?;

            // 受邀人不能为邀请人
            ensure!(invitee != inviter.clone(), Error::<T>::OperationIsNotAllowed);

            // 受邀人是否已有邀请关系
            ensure!(!InviterRelationship::<T>::contains_key(&invitee), Error::<T>::InviterRelationshipIsExisted);

            let mut invitation = InviterRegistration::<T>::get(&inviter).ok_or(Error::<T>::InvitationInfoIsNotExisted)?;

            // 把受邀人账户编码为32字节的消息
            let enc_invitee = invitee.encode();
            let msg: [u8; 32] = Decode::decode(&mut &enc_invitee[..]).or(Err(Error::<T>::DecodeFailed))?;

            //验证邀请签名
            let signature = ed25519::Signature::from_raw(invitation_sig);
            let pk = ed25519::Public::from_raw(invitation.invitation_pk);
            let flag = signature.verify(msg.as_ref(), &pk);
            // let flag = ed25519::Pair::verify_weak(&invitation_sig, &msg, &invitation.invitation_pk);
            ensure!(flag, Error::<T>::InvitationSignatureIsInvalid);

            let value = invitation.unit_bonus.clone();
            let invitation_account = Self::invitation_account_id(invitation.invitation_index.clone());

            let num_of_invited = invitation.num_of_invited.checked_add(1).ok_or(Error::<T>::ValueOverflow)?;

            // 转账赠金给受邀人
            T::Currency::resolve_creating(&invitee, T::Currency::withdraw(
                &invitation_account,
                value,
                WithdrawReasons::from(WithdrawReason::Transfer),
                ExistenceRequirement::AllowDeath,
            )?);

            //建立邀请人与受邀人关系
            InviterRelationship::<T>::insert(&invitee, inviter.clone());

            let invitation_account_balance = T::Currency::free_balance(&invitation_account);

            let mut is_end = false;
            if num_of_invited == invitation.max_invitees && invitation_account_balance == Zero::zero() {
                // 如果受邀人总数已经达到最大邀请人数，删除邀请信息，不再邀请
                InviterRegistration::<T>::remove(&inviter);
                is_end = true;
            } else {
                // 增加已邀人数
                invitation.num_of_invited = num_of_invited;
                InviterRegistration::<T>::insert(&inviter, invitation);
            }

            Self::deposit_event(RawEvent::AcceptInvitation(invitee, invitation_sig, inviter.clone(), value));

            if is_end {
                let now = <frame_system::Module<T>>::block_number();
                Self::deposit_event(RawEvent::EndInvitationPeriod(inviter, Zero::zero(), num_of_invited, now));
            }

            Ok(())
        }

        /// end_invitation_period
        /// - inviter address 邀请人账户地址
        #[weight = 10_000 + T::DbWeight::get().writes(1)]
        pub fn end_invitation_period(origin) -> dispatch::DispatchResult {
            let inviter = ensure_signed(origin)?;

            let invitation = InviterRegistration::<T>::get(&inviter).ok_or(Error::<T>::InvitationInfoIsNotExisted)?;
            let invitation_account = Self::invitation_account_id(invitation.invitation_index);
            let refund_amount = T::Currency::free_balance(&invitation_account);

            // 赎回金额给邀请人
            T::Currency::resolve_creating(&inviter, T::Currency::withdraw(
                &invitation_account,
                refund_amount,
                WithdrawReasons::from(WithdrawReason::Transfer),
                ExistenceRequirement::AllowDeath,
            )?);

            // 删除邀请信息
            InviterRegistration::<T>::remove(&inviter);

            let now = <frame_system::Module<T>>::block_number();
            Self::deposit_event(RawEvent::EndInvitationPeriod(inviter, refund_amount, invitation.num_of_invited, now));
            Ok(())
        }
    }
}

impl<T: Trait> Module<T> {
    /// The account ID of the order.
    ///
    /// This actually does computation. If you need to keep using it, then make sure you cache the
    /// value and only call this once.
    pub fn invitation_account_id(index: InvitationIndex) -> T::AccountId {
        PALLET_ID.into_sub_account(index)
    }
}

/// 支持未签名交易
impl<T: Trait> frame_support::unsigned::ValidateUnsigned for Module<T> {
    type Call = Call<T>;

    fn validate_unsigned(_source: TransactionSource, call: &Self::Call) -> TransactionValidity {
        const UNSIGNED_TXS_PRIORITY: u64 = 100;
        let valid_tx = |provide| {
            ValidTransaction::with_tag_prefix("invitation")
                .priority(UNSIGNED_TXS_PRIORITY)
                .and_provides([&provide])
                .longevity(TransactionLongevity::max_value())
                .propagate(true)
                .build()
        };

        match call {
            Call::accept_invitation(ref invitee, ref invitation_sig, ref inviter) => {
                // 受邀人不能为邀请人
                ensure!(
                    invitee != inviter,
                    InvalidTransaction::Custom(Error::<T>::OperationIsNotAllowed.as_u8())
                );

                // 受邀人是否已有邀请关系
                ensure!(
                    !InviterRelationship::<T>::contains_key(invitee),
                    InvalidTransaction::Custom(Error::<T>::InviterRelationshipIsExisted.as_u8())
                );

                let invitation = InviterRegistration::<T>::get(inviter).ok_or(
                    InvalidTransaction::Custom(Error::<T>::InvitationInfoIsNotExisted.as_u8()),
                )?;

                // 把受邀人账户编码为32字节的消息
                let enc_invitee = invitee.encode();
                let msg: [u8; 32] =
                    Decode::decode(&mut &enc_invitee[..]).or(Err(InvalidTransaction::BadProof))?;

                //验证邀请签名
                let signature = ed25519::Signature::from_raw(invitation_sig.to_owned());
                let pk = ed25519::Public::from_raw(invitation.invitation_pk);
                let flag = signature.verify(msg.as_ref(), &pk);
                ensure!(flag, InvalidTransaction::BadProof);

                valid_tx((invitee, invitation_sig, inviter))
            }
            _ => InvalidTransaction::Call.into(),
        }
    }
}
