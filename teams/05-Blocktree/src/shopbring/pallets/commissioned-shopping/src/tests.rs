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
use blake2_rfc::blake2b::blake2b;
use codec::Encode;
use frame_support::{assert_err, assert_ok};
use mock::*;
use sp_core::crypto::Ss58Codec;
use sp_core::H256;

fn original_order_info() -> OrderInfoOf<Test> {
    OrderInfo {
        consumer: ALICE,
        shopping_agent: None,
        payment_amount: 1000u128,
        tip: 100u128,
        return_amount: 0u128,
        currency: NATIVE_ASSET_ID,
        status: OrderStatus::Pending,
        required_deposit: 30u128,
        required_credit: 0u64,
        shipping_hash: None,
        is_return: false,
        version: 0u32,
        create_time: 0u64,
        accept_time: 0u64,
        shipping_time: 0u64,
        end_time: 0u64,
    }
    // return order
}

/// generate_test_order_hash 生产订单哈希
fn generate_test_order_hash(order: &OrderInfoOf<Test>) -> H256 {
    // 订单序列化规则
    let mut data: Vec<u8> = Vec::new();
    data.extend(order.version.encode());
    data.extend(order.consumer.encode());
    data.extend(order.payment_amount.encode());
    data.extend(order.tip.encode());
    data.extend(order.currency.encode());
    data.extend(order.create_time.encode());
    data.extend(order.required_deposit.encode());
    data.extend(order.required_credit.encode());
    data.extend(vec![1, 2, 3, 4, 5, 6].encode());
    let ext_order_hash = blake2b(32, &[], &data[..]);
    H256::from_slice(ext_order_hash.as_bytes())
}

fn original_return_info(return_amount: u128) -> ReturnInfoOf<Test> {
    ReturnInfo {
        consumer: ALICE,
        shopping_agent: BOB,
        return_amount: return_amount,
        status: ReturnStatus::Applied,
        create_time: 0u64,
        accept_time: 0u64,
        shipping_time: 0u64,
        end_time: 0u64,
        shipping_hash: None,
        version: 0u32,
    }
}

/// generate_test_return_info_hash 生产退货订单哈希
fn generate_test_return_info_hash(ext_order_hash: &H256, order: &ReturnInfoOf<Test>) -> H256 {
    // 订单序列化规则
    let mut data: Vec<u8> = Vec::new();
    data.extend(order.version.encode());
    data.extend(order.consumer.encode());
    data.extend(ext_order_hash.to_owned().encode());
    data.extend(order.return_amount.encode());
    data.extend(order.create_time.encode());
    let ext_return_hash = blake2b(32, &[], &data[..]);
    H256::from_slice(ext_return_hash.as_bytes())
}

#[test]
fn encode_hash() {
    let mut data: Vec<u8> = Vec::new();
    data.extend("123".encode());
    data.extend("456".encode());
    let hash = blake2b(32, &[], &data[..]);
    println!("hash: {}", hex::encode(hash));
}

/// 订单编码
#[test]
fn order_info_encode_test() {
    // Using the convenience function.
    let hash = generate_test_order_hash(&original_order_info());
    let hash_hex = hex::encode(hash);
    println!("hash: {}", hash_hex);

    let expect_hex =
        String::from("96b3c142f5afc89e678b2e46cea58a77f0f2dfcf503488c6d864b676cc0d0b08");
    assert_eq!(hash_hex, expect_hex);
}

/// 正常代购交易
#[test]
fn normal_commissioned_shopping() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    let order_account = CommissionedShopping::order_account_id(ext_order_hash);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者最初的余额
        let origin_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        // 代购者最初的余额
        let origin_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        // 订单最初的余额
        let origin_order_balance =
            GenericAsset::free_balance(origin_order.currency, &order_account);

        println!("origin_consumer_balance = {}", origin_consumer_balance);
        println!(
            "origin_shopping_agent_balance = {}",
            origin_shopping_agent_balance
        );
        println!("origin_order_balance = {}", origin_order_balance);

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        // 检查链上订单数据
        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.consumer, origin_order.consumer);
        assert_eq!(order.shopping_agent, None);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        // 检查消费者余额 new_balance = old_balance - payment_amount - tip
        let new_consumer_balance =
            GenericAsset::free_balance(origin_order.currency, &order.consumer);
        println!("consumer_balance = {}", new_consumer_balance);

        let mut expected_order_balance =
            origin_order.payment_amount.saturating_add(origin_order.tip);
        let new_order_balance = GenericAsset::free_balance(origin_order.currency, &order_account);
        println!("new_order_balance = {}", new_order_balance);

        assert_eq!(
            new_consumer_balance,
            origin_consumer_balance.saturating_sub(expected_order_balance)
        );

        assert_eq!(new_order_balance, expected_order_balance);

        System::set_block_number(System::block_number() + 5);

        // 消费者提交重复哈希的代购单
        assert_err!(
            CommissionedShopping::apply_shopping_order(
                Origin::signed(consumer),
                origin_order.payment_amount,
                origin_order.tip,
                origin_order.currency,
                origin_order.required_deposit,
                origin_order.required_credit,
                origin_order.version,
                ext_order_hash,
            ),
            Error::<Test>::ShoppingOrderIsExisted
        );

        // 代购者接受订单
        assert_ok!(CommissionedShopping::accept_shopping_order(
            Origin::signed(shopping_agent),
            ext_order_hash,
        ));

        // 检查代购者余额 new_balance = old_balance - required_deposit
        let new_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        println!(
            "new_shopping_agent_balance = {}",
            new_shopping_agent_balance
        );

        expected_order_balance =
            expected_order_balance.saturating_add(origin_order.required_deposit);
        let new_order_balance = GenericAsset::free_balance(origin_order.currency, &order_account);
        println!("new_order_balance = {}", new_order_balance);

        assert_eq!(
            new_shopping_agent_balance,
            origin_shopping_agent_balance.saturating_sub(origin_order.required_deposit)
        );

        assert_eq!(new_order_balance, expected_order_balance);

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.consumer, origin_order.consumer);
        assert_eq!(order.shopping_agent, Some(shopping_agent));
        assert_eq!(order.status, OrderStatus::Accepted);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        System::set_block_number(System::block_number() + 5);

        // 消费者关闭代购单，订单状态，无法关闭
        assert_err!(
            CommissionedShopping::close_shopping_order(Origin::signed(consumer), ext_order_hash,),
            Error::<Test>::OperationIsNotAllowed
        );

        // 代购者发货
        let shipping_hash = H256::from([1; 32]);
        println!("shipping_hash = {}", shipping_hash);
        assert_ok!(CommissionedShopping::do_commodity_shipping(
            Origin::signed(shopping_agent),
            ext_order_hash,
            shipping_hash,
        ));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.shipping_hash, Some(shipping_hash));
        assert_eq!(order.status, OrderStatus::Shipping);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        System::set_block_number(System::block_number() + 5);

        // 消费者关闭代购单，订单状态，无法关闭
        assert_err!(
            CommissionedShopping::close_shopping_order(Origin::signed(consumer), ext_order_hash,),
            Error::<Test>::OperationIsNotAllowed
        );

        // 消费者确认到货
        assert_ok!(CommissionedShopping::confirm_commodity_received(
            Origin::signed(consumer),
            ext_order_hash,
        ));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.status, OrderStatus::Received);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        //检查代购者余额是否有增加
        let new_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        println!(
            "new_shopping_agent_balance = {}",
            new_shopping_agent_balance
        );

        expected_order_balance = 0;
        let new_order_balance = GenericAsset::free_balance(origin_order.currency, &order_account);
        println!("new_order_balance = {}", new_order_balance);

        assert_eq!(
            new_shopping_agent_balance,
            origin_shopping_agent_balance
                .saturating_add(order.payment_amount)
                .saturating_add(order.tip)
        );

        assert_eq!(new_order_balance, expected_order_balance);

        // 没有超时，不会发生任何事情
        assert_err!(
            CommissionedShopping::clear_shopping_order(Origin::none(), ext_order_hash,),
            Error::<Test>::NoNeedToOperate
        );

        println!("current block height = {}", System::block_number());

        // 消费者关闭代购单，订单状态，无法关闭
        assert_err!(
            CommissionedShopping::close_shopping_order(Origin::signed(consumer), ext_order_hash,),
            Error::<Test>::OperationIsNotAllowed
        );

        // 设置区块超过清理时限
        System::set_block_number(System::block_number() + 11);

        // 清理过时订单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearShoppingOrder(
                ext_order_hash,
                OrderStatus::Archived
            ))));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash);
        assert_eq!(order, None);
    });
}

/// 正常关闭订单
#[test]
fn normal_close_order() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    let order_account = CommissionedShopping::order_account_id(ext_order_hash);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者最初的余额
        let origin_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);

        println!("origin_consumer_balance = {}", origin_consumer_balance);

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        // 消费者关闭代购单
        assert_ok!(CommissionedShopping::close_shopping_order(
            Origin::signed(consumer),
            ext_order_hash,
        ));

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearShoppingOrder(
                ext_order_hash,
                OrderStatus::Closed
            ))));

        // 订单关闭后，系统直接删除
        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash);
        assert_eq!(order, None);

        let new_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        assert_eq!(origin_consumer_balance, new_consumer_balance);
    });
}

/// 商品发货超时
#[test]
fn do_commodity_shipping_timeout() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    let order_account = CommissionedShopping::order_account_id(ext_order_hash);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者最初的余额
        let origin_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        // 代购者最初的余额
        let origin_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        // 订单最初的余额
        let origin_order_balance =
            GenericAsset::free_balance(origin_order.currency, &order_account);

        println!("origin_consumer_balance = {}", origin_consumer_balance);
        println!(
            "origin_shopping_agent_balance = {}",
            origin_shopping_agent_balance
        );
        println!("origin_order_balance = {}", origin_order_balance);

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        // 代购者接受订单
        assert_ok!(CommissionedShopping::accept_shopping_order(
            Origin::signed(shopping_agent),
            ext_order_hash,
        ));

        System::set_block_number(System::block_number() + 11);

        // 代购者超时发货
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.status, OrderStatus::Failed);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        //检查订单锁定的金额是否退回给消费者，包括代购者的保证金
        let new_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        println!("new_consumer_balance = {}", new_consumer_balance);
        assert_eq!(
            new_consumer_balance,
            origin_consumer_balance.saturating_add(order.required_deposit)
        );

        //检查代购者余额是否扣掉保证金
        let new_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        println!(
            "new_shopping_agent_balance = {}",
            new_shopping_agent_balance
        );
        assert_eq!(
            new_shopping_agent_balance,
            origin_shopping_agent_balance.saturating_sub(order.required_deposit)
        );

        //检查代购者余额是否扣掉保证金
        let new_order_balance = GenericAsset::free_balance(origin_order.currency, &order_account);
        println!("new_order_balance = {}", new_order_balance);
        assert_eq!(new_order_balance, 0);

        // 没有超时，不会发生任何事情
        assert_err!(
            CommissionedShopping::clear_shopping_order(Origin::none(), ext_order_hash,),
            Error::<Test>::NoNeedToOperate
        );

        // 设置区块超过清理时限
        System::set_block_number(System::block_number() + 11);

        // 清理过时订单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearShoppingOrder(
                ext_order_hash,
                OrderStatus::Archived
            ))));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash);
        assert_eq!(order, None);
    });
}

/// 确认收货超时
#[test]
fn receive_commodity_timeout() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    let order_account = CommissionedShopping::order_account_id(ext_order_hash);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者最初的余额
        let origin_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        // 代购者最初的余额
        let origin_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        // 订单最初的余额
        let origin_order_balance =
            GenericAsset::free_balance(origin_order.currency, &order_account);

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        System::set_block_number(System::block_number() + 5);

        // 代购者接受订单
        assert_ok!(CommissionedShopping::accept_shopping_order(
            Origin::signed(shopping_agent),
            ext_order_hash,
        ));

        // 代购者发货
        let shipping_hash = H256::from([1; 32]);
        println!("shipping_hash = {}", shipping_hash);
        assert_ok!(CommissionedShopping::do_commodity_shipping(
            Origin::signed(shopping_agent),
            ext_order_hash,
            shipping_hash,
        ));

        // 消费者超过确认收货时间
        System::set_block_number(System::block_number() + 11);

        // 清理过时订单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.status, OrderStatus::Received);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        // 消费者确认到货，不成功
        assert_err!(
            CommissionedShopping::confirm_commodity_received(
                Origin::signed(consumer),
                ext_order_hash,
            ),
            Error::<Test>::OperationIsNotAllowed
        );

        let new_order_balance = GenericAsset::free_balance(origin_order.currency, &order_account);

        //检查代购者余额是否有增加
        let new_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        println!(
            "new_shopping_agent_balance = {}",
            new_shopping_agent_balance
        );

        assert_eq!(
            new_shopping_agent_balance,
            origin_shopping_agent_balance
                .saturating_add(order.payment_amount)
                .saturating_add(order.tip)
        );

        assert_eq!(new_order_balance, 0);

        // 设置区块超过清理时限
        System::set_block_number(System::block_number() + 11);

        // 清理过时订单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash);
        assert_eq!(order, None);
    });
}

/// 正常商品退货
#[test]
fn normal_commodity_return() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    let order_account = CommissionedShopping::order_account_id(ext_order_hash);
    let origin_return = original_return_info(300);
    let ext_return_hash = generate_test_return_info_hash(&ext_order_hash, &origin_return);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者最初的余额
        let origin_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        // 代购者最初的余额
        let origin_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        // 订单最初的余额
        let origin_order_balance =
            GenericAsset::free_balance(origin_order.currency, &order_account);

        println!("origin_consumer_balance = {}", origin_consumer_balance);
        println!(
            "origin_shopping_agent_balance = {}",
            origin_shopping_agent_balance
        );
        println!("origin_order_balance = {}", origin_order_balance);

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        // 检查退货金额是否解锁给消费
        let new_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        println!("new_consumer_balance = {}", new_consumer_balance);

        // 代购者接受订单
        assert_ok!(CommissionedShopping::accept_shopping_order(
            Origin::signed(shopping_agent),
            ext_order_hash,
        ));

        // 未货前就发起退货
        assert_err!(
            CommissionedShopping::apply_commodity_return(
                Origin::signed(consumer),
                ext_order_hash,
                ext_return_hash,
                origin_return.return_amount
            ),
            Error::<Test>::OperationIsNotAllowed
        );

        // 代购者发货
        let shipping_hash = H256::from([1; 32]);
        println!("shipping_hash = {}", shipping_hash);
        assert_ok!(CommissionedShopping::do_commodity_shipping(
            Origin::signed(shopping_agent),
            ext_order_hash,
            shipping_hash,
        ));

        // 不是消费者发起退货
        assert_err!(
            CommissionedShopping::apply_commodity_return(
                Origin::signed(shopping_agent),
                ext_order_hash,
                ext_return_hash,
                origin_return.return_amount
            ),
            Error::<Test>::OperationIsNotAllowed
        );

        // 消费者发起退货，申请的金额超过支付的金额
        assert_err!(
            CommissionedShopping::apply_commodity_return(
                Origin::signed(consumer),
                ext_order_hash,
                ext_return_hash,
                1001u128,
            ),
            Error::<Test>::ReturnAmountIsOverPayAmount
        );

        // 消费者发起退货
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash,
            origin_return.return_amount,
        ));

        let return_order =
            CommissionedShopping::get_returning_orders(&ext_order_hash, &ext_return_hash)
                .expect("none return order");
        assert_eq!(return_order.status, ReturnStatus::Applied);
        assert_eq!(return_order.return_amount, origin_return.return_amount);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ReturnOrderUpdated(
                ext_order_hash,
                ext_return_hash,
                return_order.clone(),
            ))));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.status, OrderStatus::Returning);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        // 代购者接受退货
        assert_ok!(CommissionedShopping::response_commodity_return(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash,
            true,
        ));

        let return_order =
            CommissionedShopping::get_returning_orders(&ext_order_hash, &ext_return_hash)
                .expect("none return order");
        assert_eq!(return_order.status, ReturnStatus::Accepted);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ReturnOrderUpdated(
                ext_order_hash,
                ext_return_hash,
                return_order.clone(),
            ))));

        //消费者发货
        let shipping_hash = H256::from([1; 32]);
        assert_ok!(CommissionedShopping::do_commodity_returning(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash,
            shipping_hash,
        ));

        let return_order =
            CommissionedShopping::get_returning_orders(&ext_order_hash, &ext_return_hash)
                .expect("none return order");
        assert_eq!(return_order.status, ReturnStatus::Shipping);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ReturnOrderUpdated(
                ext_order_hash,
                ext_return_hash,
                return_order.clone(),
            ))));

        //代购者确认收到退货
        assert_ok!(CommissionedShopping::confirm_commodity_returned(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash,
        ));

        let return_order =
            CommissionedShopping::get_returning_orders(&ext_order_hash, &ext_return_hash)
                .expect("none return order");
        assert_eq!(return_order.status, ReturnStatus::Returned);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ReturnOrderUpdated(
                ext_order_hash,
                ext_return_hash,
                return_order.clone(),
            ))));

        // 检查退货金额是否解锁给消费
        let consumer_balance_after_returned =
            GenericAsset::free_balance(origin_order.currency, &consumer);
        println!(
            "consumer_balance_after_returned = {}",
            consumer_balance_after_returned
        );

        assert_eq!(
            new_consumer_balance.saturating_add(return_order.return_amount),
            consumer_balance_after_returned
        );

        // 检查订单的金额是否扣除了退货金额
        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(
            order.payment_amount,
            origin_order
                .payment_amount
                .saturating_sub(return_order.return_amount)
        );
        assert_eq!(order.return_amount, return_order.return_amount);

        // 设置区块超过清理时限
        System::set_block_number(System::block_number() + 11);

        // 清理过时订单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearCommodityReturn(
                ext_order_hash,
                ext_return_hash,
                ReturnStatus::Archived,
            ))));

        let return_order =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash);
        assert_eq!(return_order, None);

        // 清理过时订单，因为订单状态重置为Shipping，shipping也重新计算，所以这里不会调用成功
        assert_err!(
            CommissionedShopping::clear_shopping_order(Origin::none(), ext_order_hash,),
            Error::<Test>::NoNeedToOperate
        );

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("none order");
        assert_eq!(order.status, OrderStatus::Shipping);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));

        // 消费者确认完成订单
        assert_ok!(CommissionedShopping::confirm_commodity_received(
            Origin::signed(consumer),
            ext_order_hash,
        ));

        //检查代购者余额是否有增加
        let new_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        println!(
            "new_shopping_agent_balance = {}",
            new_shopping_agent_balance
        );

        // 代购者最终收到的报酬 = 订单原支付金额 + 小费 - 退货金额
        assert_eq!(
            new_shopping_agent_balance,
            origin_shopping_agent_balance
                .saturating_add(origin_order.payment_amount)
                .saturating_add(origin_order.tip)
                .saturating_sub(origin_return.return_amount)
        );
    });
}

/// 多个商品退货
#[test]
fn multiple_commodity_return() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    let order_account = CommissionedShopping::order_account_id(ext_order_hash);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者最初的余额
        let origin_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);
        // 代购者最初的余额
        let origin_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        // 订单最初的余额
        let origin_order_balance =
            GenericAsset::free_balance(origin_order.currency, &order_account);

        println!("origin_consumer_balance = {}", origin_consumer_balance);
        println!(
            "origin_shopping_agent_balance = {}",
            origin_shopping_agent_balance
        );
        println!("origin_order_balance = {}", origin_order_balance);

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        // 代购者接受订单
        assert_ok!(CommissionedShopping::accept_shopping_order(
            Origin::signed(shopping_agent),
            ext_order_hash,
        ));

        // 代购者发货
        let shipping_hash = H256::from([1; 32]);
        println!("shipping_hash = {}", shipping_hash);
        assert_ok!(CommissionedShopping::do_commodity_shipping(
            Origin::signed(shopping_agent),
            ext_order_hash,
            shipping_hash,
        ));

        // 消费者余额
        let new_consumer_balance = GenericAsset::free_balance(origin_order.currency, &consumer);

        System::set_block_number(System::block_number() + 5);

        let origin_return_1 = original_return_info(300);
        let ext_return_hash_1 = generate_test_return_info_hash(&ext_order_hash, &origin_return_1);

        // 消费者发起退货
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash_1,
            origin_return_1.return_amount,
        ));

        // 隔间5个区块链再申请退货
        System::set_block_number(System::block_number() + 5);

        // 发起相同的退货单
        assert_err!(
            CommissionedShopping::apply_commodity_return(
                Origin::signed(consumer),
                ext_order_hash,
                ext_return_hash_1,
                origin_return_1.return_amount,
            ),
            Error::<Test>::ReturnedOrderIsExisted
        );

        let origin_return_2 = original_return_info(200);
        let ext_return_hash_2 = generate_test_return_info_hash(&ext_order_hash, &origin_return_2);

        println!("ext_return_hash_1 = {}", hex::encode(ext_return_hash_1));
        println!("ext_return_hash_2 = {}", hex::encode(ext_return_hash_2));

        // 发起第二个退货单
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash_2,
            origin_return_2.return_amount,
        ));

        // 代购者接受退货
        assert_ok!(CommissionedShopping::response_commodity_return(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash_1,
            true,
        ));

        //消费者发货
        let shipping_hash = H256::from([1; 32]);
        assert_ok!(CommissionedShopping::do_commodity_returning(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash_1,
            shipping_hash,
        ));

        //代购者确认收到退货
        assert_ok!(CommissionedShopping::confirm_commodity_returned(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash_1,
        ));

        // 设置区块超过清理时限
        System::set_block_number(System::block_number() + 6);

        // 清理过时订单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        // ext_return_hash_1状态已完成，被系统清理，不再存在
        let return_order_1 =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash_1);
        assert_eq!(return_order_1, None);

        // ext_return_hash_2还没超时，还存在
        let return_order_2 =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash_2)
                .expect("return order 2 is not existed");
        assert_eq!(return_order_2.status, ReturnStatus::Applied);

        // 设置区块超过清理时限
        System::set_block_number(System::block_number() + 5);

        // ext_return_hash_2 代购者超时回应，退货金额转给消费者
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        let return_order_2 =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash_2)
                .expect("return order 2 is not existed");
        assert_eq!(return_order_2.status, ReturnStatus::NoResponse);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ReturnOrderUpdated(
                ext_order_hash,
                ext_return_hash_2,
                return_order_2.clone(),
            ))));

        // 检查退货金额是否解锁给消费
        let consumer_balance_after_returned =
            GenericAsset::free_balance(origin_order.currency, &consumer);
        println!(
            "consumer_balance_after_returned = {}",
            consumer_balance_after_returned
        );

        assert_eq!(
            new_consumer_balance
                .saturating_add(origin_return_1.return_amount)
                .saturating_add(origin_return_2.return_amount),
            consumer_balance_after_returned
        );

        // 退货单还没清理，消费者确认完成订单，同时把完成的退货单清理
        assert_ok!(
            CommissionedShopping::confirm_commodity_received(
                Origin::signed(consumer),
                ext_order_hash,
            )
        );

        //检查代购者余额是否有增加
        let new_shopping_agent_balance =
            GenericAsset::free_balance(origin_order.currency, &shopping_agent);
        println!(
            "new_shopping_agent_balance = {}",
            new_shopping_agent_balance
        );

        // 代购者最终收到的报酬 = 订单原支付金额 + 小费 - 退货金额
        assert_eq!(
            new_shopping_agent_balance,
            origin_shopping_agent_balance
                .saturating_add(origin_order.payment_amount)
                .saturating_add(origin_order.tip)
                .saturating_sub(origin_return_1.return_amount)
                .saturating_sub(origin_return_2.return_amount)
        );
    });
}

/// 取消退货单
#[test]
fn cancel_return_order() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        // 代购者接受订单
        assert_ok!(CommissionedShopping::accept_shopping_order(
            Origin::signed(shopping_agent),
            ext_order_hash,
        ));

        // 代购者发货
        let shipping_hash = H256::from([1; 32]);
        println!("shipping_hash = {}", shipping_hash);
        assert_ok!(CommissionedShopping::do_commodity_shipping(
            Origin::signed(shopping_agent),
            ext_order_hash,
            shipping_hash,
        ));

        let origin_return = original_return_info(300);
        let ext_return_hash = generate_test_return_info_hash(&ext_order_hash, &origin_return);

        // 消费者发起退货
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash,
            origin_return.return_amount,
        ));

        // 不是消费者取消退货，失败
        assert_err!(
            CommissionedShopping::cancel_commodity_return(
                Origin::signed(shopping_agent),
                ext_order_hash,
                ext_return_hash,
            ),
            Error::<Test>::OperationIsNotAllowed
        );

        // 消费者取消退货
        assert_ok!(CommissionedShopping::cancel_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearCommodityReturn(
                ext_order_hash,
                ext_return_hash,
                ReturnStatus::Closed,
            ))));

        // 清理退货单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        // 检查退货单是否存在
        let return_order =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash);
        assert_eq!(return_order, None);

        // 订单状态是否变更为Shipping
        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("order is not existed");
        assert_eq!(order.status, OrderStatus::Shipping);

        // 消费者发起退货
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash,
            origin_return.return_amount,
        ));

        // 代购者接受退货单
        assert_ok!(CommissionedShopping::response_commodity_return(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash,
            true,
        ));

        //消费者超过发货时间，订单变为取消
        System::set_block_number(System::block_number() + 11);

        // 清理退货单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearCommodityReturn(
                ext_order_hash,
                ext_return_hash,
                ReturnStatus::Archived,
            ))));

        // 检查退货单是否存在
        let return_order =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash);
        assert_eq!(return_order, None);

        // 消费者发起退货
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash,
            origin_return.return_amount,
        ));

        // 不是代购者拒绝退货
        assert_err!(
            CommissionedShopping::response_commodity_return(
                Origin::signed(CHARLIE),
                ext_order_hash,
                ext_return_hash,
                false,
            ),
            Error::<Test>::OperationIsNotAllowed
        );

        // 代购者拒绝退货
        assert_ok!(CommissionedShopping::response_commodity_return(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash,
            false,
        ));

        let return_order =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash)
                .expect("return order is not existed");
        assert_eq!(return_order.status, ReturnStatus::Refused);

        //检查事件数据
        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ReturnOrderUpdated(
                ext_order_hash,
                ext_return_hash,
                return_order.clone(),
            ))));

        // 清理退货单
        assert_ok!(CommissionedShopping::clear_shopping_order(
            Origin::none(),
            ext_order_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearCommodityReturn(
                ext_order_hash,
                ext_return_hash,
                ReturnStatus::Archived,
            ))));

        // 检查退货单是否存在
        let return_order =
            CommissionedShopping::get_returning_orders(ext_order_hash, ext_return_hash);
        assert_eq!(return_order, None);
    });
}

/// 在清理退货单之前，消费者确认商品到货
#[test]
fn confirm_commodity_received_before_clear_return_order() {
    let origin_order = original_order_info();
    let ext_order_hash = generate_test_order_hash(&origin_order);
    ExtBuilder::default().build().execute_with(|| {
        let consumer = ALICE;
        let shopping_agent = BOB;

        // 消费者提交代购单
        assert_ok!(CommissionedShopping::apply_shopping_order(
            Origin::signed(consumer),
            origin_order.payment_amount,
            origin_order.tip,
            origin_order.currency,
            origin_order.required_deposit,
            origin_order.required_credit,
            origin_order.version,
            ext_order_hash,
        ));

        // 代购者接受订单
        assert_ok!(CommissionedShopping::accept_shopping_order(
            Origin::signed(shopping_agent),
            ext_order_hash,
        ));

        // 代购者发货
        let shipping_hash = H256::from([1; 32]);
        println!("shipping_hash = {}", shipping_hash);
        assert_ok!(CommissionedShopping::do_commodity_shipping(
            Origin::signed(shopping_agent),
            ext_order_hash,
            shipping_hash,
        ));

        let origin_return_1 = original_return_info(300);
        let ext_return_hash_1 = generate_test_return_info_hash(&ext_order_hash, &origin_return_1);

        // 消费者发起退货
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash_1,
            origin_return_1.return_amount,
        ));

        // 消费者还有申请中的退货单，无法成功确认到货，要先关闭申请的退货单
        assert_ok!(CommissionedShopping::confirm_commodity_received(
            Origin::signed(consumer),
            ext_order_hash,
        ));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("order is not existed");
        assert_eq!(order.status, OrderStatus::Returning);

        let origin_return_2 = original_return_info(200);
        let ext_return_hash_2 = generate_test_return_info_hash(&ext_order_hash, &origin_return_2);

        // 再发起一笔退货单
        assert_ok!(CommissionedShopping::apply_commodity_return(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash_2,
            origin_return_2.return_amount,
        ));

        // 代购者接受退货单
        assert_ok!(CommissionedShopping::response_commodity_return(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash_1,
            true,
        ));

        //消费者发货
        let shipping_hash = H256::from([1; 32]);
        assert_ok!(CommissionedShopping::do_commodity_returning(
            Origin::signed(consumer),
            ext_order_hash,
            ext_return_hash_1,
            shipping_hash,
        ));

        // 商家确认到货
        assert_ok!(CommissionedShopping::confirm_commodity_returned(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash_1,
        ));

        // 消费者确认代购，先处理已结束的订单，但还有一笔申请没完成，所以确认到货时间仍不响应
        assert_ok!(CommissionedShopping::confirm_commodity_received(
            Origin::signed(consumer),
            ext_order_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearCommodityReturn(
                ext_order_hash,
                ext_return_hash_1,
                ReturnStatus::Archived,
            ))));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("order is not existed");
        assert_eq!(order.status, OrderStatus::Returning);

        // 代购者拒绝退货
        assert_ok!(CommissionedShopping::response_commodity_return(
            Origin::signed(shopping_agent),
            ext_order_hash,
            ext_return_hash_2,
            false,
        ));

        // 退货单都已经完结，消费确认到货成功
        assert_ok!(CommissionedShopping::confirm_commodity_received(
            Origin::signed(consumer),
            ext_order_hash,
        ));

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ClearCommodityReturn(
                ext_order_hash,
                ext_return_hash_2,
                ReturnStatus::Archived,
            ))));

        let order = CommissionedShopping::get_commissioned_shopping_orders(ext_order_hash)
            .expect("order is not existed");
        assert_eq!(order.status, OrderStatus::Received);

        assert!(System::events().iter().any(|record| record.event
            == TestEvent::commissioned_shopping(RawEvent::ShoppingOrderUpdated(
                ext_order_hash,
                order.clone(),
            ))));
    });
}
#[test]
fn account_id_from_ss58() {
    let pubkey =
        primitives::AccountId::from_ss58check("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")
            .expect("lll");
    let pubkey_hex = hex::encode(pubkey);
    println!("pubkey hex: {}", pubkey_hex);
}
