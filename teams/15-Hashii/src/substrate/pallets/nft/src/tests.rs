use crate::mock::*;
use super::*;
use frame_support::{assert_ok, assert_noop};

#[test]
fn test_ntf_create() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		let lock_event = TestEvent::nft_event(RawEvent::NftCreated(1, 0));
		assert!(System::events().iter().any(|a| a.event == lock_event));
		assert!(Nfts::<Test>::get(&0).is_some());
		assert_eq!(NftAccount::<Test>::get(&0), 1);
	});
}

#[test]
fn test_ntf_remove_success() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_ok!(NftModule::remove(Origin::signed(1), 0));

		let lock_event = TestEvent::nft_event(RawEvent::NftRemove(1, 0));
		assert!(System::events().iter().any(|a| a.event == lock_event));
		assert!(Nfts::<Test>::get(&0).is_none());
		assert_ne!(NftAccount::<Test>::get(&0), 1);
	});
}

#[test]
fn test_ntf_remove_not_exist() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_noop!(NftModule::remove(Origin::signed(1), 0), Error::<Test>::NftIdNotExist);
	});
}

#[test]
fn test_ntf_remove_not_owner() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_noop!(NftModule::remove(Origin::signed(2), 0), Error::<Test>::NotNftOwner);
	});
}

#[test]
fn test_nft_remove_order_exist() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_ok!(NftModule::order_sell(Origin::signed(1), 0, 100, 200, 200));
		assert_noop!(NftModule::remove(Origin::signed(1), 0), Error::<Test>::NftOrderExist);
	});
}

#[test]
fn test_ntf_transfer_success() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_ok!(NftModule::transfer(Origin::signed(1), 2, 0));

		let lock_event = TestEvent::nft_event(RawEvent::NftTransfer(1, 2,0));
		assert!(System::events().iter().any(|a| a.event == lock_event));
		assert!(Nfts::<Test>::get(&0).is_some());
		assert_eq!(NftAccount::<Test>::get(&0), 2);
	});
}

#[test]
fn test_ntf_transfer_not_exist() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_noop!(NftModule::transfer(Origin::signed(1), 2, 0), Error::<Test>::NftIdNotExist);
	});
}

#[test]
fn test_ntf_transfer_not_owner() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_noop!(NftModule::transfer(Origin::signed(2), 3, 0), Error::<Test>::NotNftOwner);
	});
}

#[test]
fn test_nft_transfer_order_exist() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_ok!(NftModule::order_sell(Origin::signed(1), 0, 100, 200, 200));
		assert_noop!(NftModule::transfer(Origin::signed(1), 2, 0), Error::<Test>::NftOrderExist);
	});
}

#[test]
fn test_order_sell_success() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_ok!(NftModule::order_sell(Origin::signed(1), 0, 100, 200, 200));
		let order_opt: Option<OrderOf<Test>> = Orders::<Test>::get(&0);
		assert!(order_opt.is_some());
		let order = order_opt.unwrap();
		assert_eq!(order.owner, 1);
		assert_eq!(order.order_id, 0);
		assert_eq!(order.start_price, 100);
		assert_eq!(order.end_price, 200);
		assert_eq!(order.keep_block_num, 200);
		assert_eq!(order.nft_id, 0);
		assert_eq!(NftOrder::<Test>::get(&0), Some(0));
	});
}

#[test]
fn test_order_buy_success() {
	new_test_ext().execute_with(|| {
		run_to_block(10);
		assert_ok!(NftModule::create(Origin::signed(1), "title_value".into(), "url_value".into(), "desc_value".into()));
		assert_ok!(NftModule::order_sell(Origin::signed(1), 0, 100, 200, 10000));
		assert_ok!(NftModule::order_buy(Origin::signed(2), 0, 200));
		assert!(Orders::<Test>::get(&0).is_none());
		assert!(NftOrder::<Test>::get(&0).is_none());
		assert_eq!(NftAccount::<Test>::get(&0), 2);
	});
}