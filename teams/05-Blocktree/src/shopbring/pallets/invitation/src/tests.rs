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

//! Tests for the module.
#![cfg(test)]

use super::*;
use frame_support::{assert_err, assert_ok};
use hex_literal::hex;
use mock::*;
use sp_core::crypto::Ss58Codec;
use sp_core::{ed25519, hexdisplay::HexDisplay, Pair};

#[test]
fn max_u128() {
    println!("max u128 = {}", u128::max_value());
}

#[test]
fn generate_inviter_keypair() {
    // The inviter private key
    let seed = hex!["3df9f0f36f7c59b4987c8d72acdf9c6424e48d6a1e09c8b3a47a0026348dbd2e"];
    let pair = ed25519::Pair::from_seed_slice(seed.as_ref()).unwrap();
    let pubkey = pair.public();
    // EVE account
    let account_pk =
        primitives::AccountId::from_ss58check("5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw")
            .expect("decode failed");
    let signature = pair.sign(account_pk.as_ref());
    let flag = ed25519::Pair::verify(&signature, account_pk.clone(), &pubkey);

    println!("inviter's ed25519-privateKey: {}", HexDisplay::from(&pair.seed().as_ref()));
    println!("inviter's ed25519-publicKey: {}", HexDisplay::from(&pubkey.as_ref()));
    println!("invitee's publicKey: {}", HexDisplay::from(&account_pk.as_ref()));
    println!("EVE invitation signature: {}", HexDisplay::from(&signature.as_ref()));
    println!("flag: {}", flag);
}

#[test]
fn inviter_register() {
    let (pair, _, _) = ed25519::Pair::generate_with_phrase(None);
    let pubkey = pair.public();

    ExtBuilder::default().build().execute_with(|| {
        let unit_bonus = 1000u128;
        let max_invitees = 2u32;
        let inviter = &ALICE.into();
        let frozen_amount = unit_bonus.saturating_mul(max_invitees.into());
        // 邀请人最初的余额
        let origin_inviter_balance = Asset::free_balance(inviter);
        println!("origin_inviter_balance = {}", origin_inviter_balance);

        // 注册成为邀请人
        assert_ok!(Invitation::register_inviter(
            Origin::signed(inviter.to_owned()),
            pubkey.into(),
            unit_bonus,
            max_invitees,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::invitation(RawEvent::RegisterInviter(
                inviter.to_owned(),
                pubkey.into(),
                unit_bonus,
                max_invitees,
                frozen_amount
            ))));

        //检查邀请人信息是否存在
        let invitation_data =
            Invitation::get_inviter_registration(inviter).expect("invitation is not existed");
        let invitation_account =
            &Invitation::invitation_account_id(invitation_data.invitation_index);

        //检查邀请人金额是否转账到表单
        let new_inviter_balance = Asset::free_balance(inviter);
        println!("new_inviter_balance = {}", new_inviter_balance);

        assert_eq!(
            new_inviter_balance,
            origin_inviter_balance.saturating_sub(unit_bonus.saturating_mul(max_invitees.into()))
        );

        //检查邀请信息的账户是否收到转账
        let invitation_account_balance = Asset::free_balance(invitation_account);
        println!(
            "invitation_account_balance = {}",
            invitation_account_balance
        );

        assert_eq!(
            invitation_account_balance,
            unit_bonus.saturating_mul(max_invitees.into())
        );

        let inviter_signature = pair.sign(inviter.as_ref());

        // 邀请人自己接受邀请
        assert_err!(
            Invitation::accept_invitation(
                Origin::none(),
                inviter.to_owned(),
                inviter_signature.clone().into(),
                inviter.to_owned(),
            ),
            Error::<Test>::OperationIsNotAllowed
        );

        //BOB接受邀请，发送不正确的签名
        assert_err!(
            Invitation::accept_invitation(
                Origin::none(),
                BOB.into(),
                inviter_signature.clone().into(),
                inviter.to_owned(),
            ),
            Error::<Test>::InvitationSignatureIsInvalid
        );

        //bob签名
        let bob_signature = pair.sign(BOB.as_ref());

        //BOB接受邀请，发送自己的账户作为消息的签名
        assert_ok!(Invitation::accept_invitation(
            Origin::none(),
            BOB.into(),
            bob_signature.clone().into(),
            inviter.to_owned(),
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::invitation(RawEvent::AcceptInvitation(
                BOB.into(),
                bob_signature.clone().into(),
                inviter.to_owned(),
                unit_bonus,
            ))));

        //BOB再次接受邀请
        assert_err!(
            Invitation::accept_invitation(
                Origin::none(),
                BOB.into(),
                bob_signature.into(),
                inviter.to_owned(),
            ),
            Error::<Test>::InviterRelationshipIsExisted
        );

        //检查bob是否收到赠金
        let bob_balance = Asset::free_balance(&BOB.into());
        println!("bob_balance = {}", bob_balance);

        assert_eq!(bob_balance, unit_bonus);

        //CHARLIE签名
        let charlie_signature = pair.sign(CHARLIE.as_ref());

        //CHARLIE接受邀请，发送自己的账户作为消息的签名
        assert_ok!(Invitation::accept_invitation(
            Origin::none(),
            CHARLIE.into(),
            charlie_signature.clone().into(),
            inviter.to_owned(),
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::invitation(RawEvent::AcceptInvitation(
                CHARLIE.into(),
                charlie_signature.clone().into(),
                inviter.to_owned(),
                unit_bonus,
            ))));

        let now = System::block_number();

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::invitation(RawEvent::EndInvitationPeriod(
                inviter.to_owned(),
                0,
                max_invitees,
                now,
            ))));

        //检查CHARLIE是否收到赠金
        let charlie_balance = Asset::free_balance(&CHARLIE.into());
        println!("charlie_balance = {}", charlie_balance);

        assert_eq!(charlie_balance, unit_bonus);

        //检查邀请人信息是否存在
        let invitation_data = Invitation::get_inviter_registration(inviter);
        assert_eq!(invitation_data, None);

        //Dave签名
        let dave_signature = pair.sign(Dave.as_ref());

        //Dave接受邀请，发送自己的账户作为消息的签名
        assert_err!(
            Invitation::accept_invitation(
                Origin::none(),
                Dave.into(),
                dave_signature.clone().into(),
                inviter.to_owned(),
            ),
            Error::<Test>::InvitationInfoIsNotExisted
        );
    });
}

#[test]
fn inviter_end_invitation() {
    let (pair, _, seed) = ed25519::Pair::generate_with_phrase(None);
    let pubkey = pair.public();

    ExtBuilder::default().build().execute_with(|| {
        let unit_bonus = 1000u128;
        let max_invitees = 2u32;
        let inviter = &ALICE.into();
        // 邀请人最初的余额
        let origin_inviter_balance = Asset::free_balance(inviter);
        println!("origin_inviter_balance = {}", origin_inviter_balance);

        // 注册成为邀请人
        assert_ok!(Invitation::register_inviter(
            Origin::signed(inviter.to_owned()),
            pubkey.into(),
            unit_bonus,
            max_invitees,
        ));

        //bob签名
        let bob_signature = pair.sign(BOB.as_ref());

        //BOB接受邀请，发送自己的账户作为消息的签名
        assert_ok!(Invitation::accept_invitation(
            Origin::none(),
            BOB.into(),
            bob_signature.clone().into(),
            inviter.to_owned(),
        ));

        //检查邀请信息的账户是否收到转账
        let invitation_data =
            Invitation::get_inviter_registration(inviter).expect("invitation is not existed");
        let invitation_account =
            &Invitation::invitation_account_id(invitation_data.invitation_index);
        let invitation_account_balance = Asset::free_balance(invitation_account);
        println!(
            "invitation_account_balance = {}",
            invitation_account_balance
        );

        //邀请人关闭邀请期
        assert_ok!(Invitation::end_invitation_period(Origin::signed(
            inviter.to_owned()
        ),));

        let now = System::block_number();
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::invitation(RawEvent::EndInvitationPeriod(
                inviter.to_owned(),
                invitation_account_balance,
                1,
                now,
            ))));

        let new_inviter_balance = Asset::free_balance(inviter);
        println!("new_inviter_balance = {}", new_inviter_balance);

        assert_eq!(
            new_inviter_balance,
            origin_inviter_balance.saturating_sub(unit_bonus * 1)
        )
    });
}
