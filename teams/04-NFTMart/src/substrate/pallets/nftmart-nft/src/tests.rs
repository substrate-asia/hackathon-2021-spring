#![cfg(test)]

use super::*;
use frame_support::{assert_noop, assert_ok};
use mock::{Event, *};

fn free_balance(who: &AccountId) -> Balance {
	<Runtime as Config>::Currency::free_balance(who)
}

fn reserved_balance(who: &AccountId) -> Balance {
	<Runtime as Config>::Currency::reserved_balance(who)
}

fn class_id_account() -> AccountId {
	<Runtime as Config>::ModuleId::get().into_sub_account(CLASS_ID)
}

#[test]
fn create_category_should_work() {
	ExtBuilder::default().build().execute_with(|| {
		assert_eq!({ let id_expect: CategoryIdOf<Runtime> = Zero::zero(); id_expect }, Nftmart::next_category_id());
		assert_eq!(None, Nftmart::categories(CATEGORY_ID));

		let metadata = vec![1];
		assert_ok!(Nftmart::create_category(Origin::root(), metadata.clone()));

		let event = Event::nftmart_nft(crate::Event::CreatedCategory(CATEGORY_ID));
		assert_eq!(last_event(), event);
		assert_eq!({ let id_expect: CategoryIdOf<Runtime> = One::one(); id_expect }, Nftmart::next_category_id());
		assert_eq!(Some(CategoryData{ metadata, nft_count: 0 }), Nftmart::categories(CATEGORY_ID));
		assert_eq!(None, Nftmart::categories(CATEGORY_ID_NOT_EXIST));

		// TODO: test update
	});
}

#[test]
fn create_category_should_fail() {
	let metadata = vec![1];
	ExtBuilder::default().build().execute_with(|| {
		assert_noop!(
			Nftmart::create_category(Origin::signed(ALICE), metadata.clone()),
			DispatchError::BadOrigin,
		);
	});
	ExtBuilder::default().build().execute_with(|| {
		NextCategoryId::<Runtime>::set(<CategoryIdOf<Runtime>>::max_value());
		assert_noop!(
			Nftmart::create_category(Origin::root(), metadata.clone()),
			Error::<Runtime>::NoAvailableCategoryId,
		);
	});
}

#[test]
fn create_class_should_work() {
	ExtBuilder::default().build().execute_with(|| {
		let metadata = vec![1];
		let name = vec![1];
		let description = vec![1];
		assert_ok!(Nftmart::create_class(Origin::signed(ALICE), metadata.clone(), name.clone(), description.clone(), Default::default()));

		let event = Event::nftmart_nft(crate::Event::CreatedClass(class_id_account(), CLASS_ID));
		assert_eq!(last_event(), event);

		let reserved = Nftmart::create_class_deposit(metadata.len() as u32, name.len() as u32, description.len() as u32).1;
		assert_eq!(reserved_balance(&class_id_account()), reserved);
	});
}

#[test]
fn create_class_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		assert_noop!(
			Nftmart::create_class(
				Origin::signed(BOB),
				vec![1], vec![1], vec![1],
				Properties(ClassProperty::Transferable | ClassProperty::Burnable)
			),
			pallet_balances::Error::<Runtime, _>::InsufficientBalance
		);
	});
}

#[test]
fn mint_should_work() {
	ExtBuilder::default().build().execute_with(|| {
		let (metadata, reserved) = {
			let metadata = vec![1];
			let name = vec![1];
			let description = vec![1];
			assert_ok!(Nftmart::create_class(
				Origin::signed(ALICE),
				metadata.clone(), name.clone(), description.clone(),
				Properties(ClassProperty::Transferable | ClassProperty::Burnable)
			));
			let event = Event::nftmart_nft(crate::Event::CreatedClass(class_id_account(), CLASS_ID));
			assert_eq!(last_event(), event);

			let deposit = Nftmart::create_class_deposit(metadata.len() as u32, name.len() as u32, description.len() as u32).1;
			(metadata, deposit)
		};

		let count: Balance = 2;
		let reserved = {
			let deposit = Nftmart::mint_token_deposit(metadata.len() as u32, count as u32).1;
			assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit as Balance).is_ok(), true);
			deposit.saturating_add(reserved)
		};

		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			count as u32
		));
		let event = Event::nftmart_nft(crate::Event::MintedToken(class_id_account(), BOB, CLASS_ID, count as u32));
		assert_eq!(last_event(), event);

		assert_eq!(reserved_balance(&class_id_account()), reserved);
	});
}

#[test]
fn mint_should_fail() {
	ExtBuilder::default().build().execute_with(|| {
		let metadata = vec![1];
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata.clone(), vec![1], vec![1],
			Properties(ClassProperty::Transferable | ClassProperty::Burnable)
		));
		assert_noop!(
			Nftmart::mint(Origin::signed(ALICE), BOB, CLASS_ID_NOT_EXIST, vec![1], 2),
			Error::<Runtime>::ClassIdNotFound
		);

		assert_noop!(
			Nftmart::mint(Origin::signed(BOB), BOB, CLASS_ID, vec![1], 0),
			Error::<Runtime>::InvalidQuantity
		);

		assert_noop!(
			Nftmart::mint(Origin::signed(BOB), BOB, CLASS_ID, vec![1], 2),
			Error::<Runtime>::NoPermission
		);

		orml_nft::NextTokenId::<Runtime>::mutate(CLASS_ID, |id| {
			*id = <Runtime as orml_nft::Config>::TokenId::max_value()
		});
		{
			let deposit = Nftmart::mint_token_deposit(metadata.len() as u32, 2).1;
			assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit).is_ok(), true);
		}
		assert_noop!(
			Nftmart::mint(Origin::signed(class_id_account()), BOB, CLASS_ID, vec![1], 2),
			orml_nft::Error::<Runtime>::NoAvailableTokenId
		);
	});
}

#[test]
fn transfer_should_work() {
	ExtBuilder::default().build().execute_with(|| {
		let metadata = vec![1];
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata.clone(), vec![1], vec![1],
			Properties(ClassProperty::Transferable | ClassProperty::Burnable)
		));
		let deposit = Nftmart::mint_token_deposit(metadata.len() as u32, 2).1;
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			2
		));

		assert_ok!(Nftmart::transfer(Origin::signed(BOB), ALICE, CLASS_ID, TOKEN_ID));
		let event = Event::nftmart_nft(crate::Event::TransferredToken(BOB, ALICE, CLASS_ID, TOKEN_ID));
		assert_eq!(last_event(), event);

		assert_ok!(Nftmart::transfer(Origin::signed(ALICE), BOB, CLASS_ID, TOKEN_ID));
		let event = Event::nftmart_nft(crate::Event::TransferredToken(ALICE, BOB, CLASS_ID, TOKEN_ID));
		assert_eq!(last_event(), event);
	});
}

#[test]
fn transfer_should_fail() {
	let metadata = vec![1];
	let deposit = Nftmart::mint_token_deposit(metadata.len() as u32, 1).1;
	ExtBuilder::default().build().execute_with(|| {
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata.clone(), vec![1], vec![1],
			Properties(ClassProperty::Transferable | ClassProperty::Burnable)
		));
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			1
		));
		assert_noop!(
			Nftmart::transfer(Origin::signed(BOB), ALICE, CLASS_ID_NOT_EXIST, TOKEN_ID),
			Error::<Runtime>::ClassIdNotFound
		);
		assert_noop!(
			Nftmart::transfer(Origin::signed(BOB), ALICE, CLASS_ID, TOKEN_ID_NOT_EXIST),
			Error::<Runtime>::TokenIdNotFound
		);
		assert_noop!(
			Nftmart::transfer(Origin::signed(ALICE), BOB, CLASS_ID, TOKEN_ID),
			Error::<Runtime>::NoPermission
		);
	});

	ExtBuilder::default().build().execute_with(|| {
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata.clone(), vec![1], vec![1],
			Default::default()
		));
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			1
		));
		assert_noop!(
			Nftmart::transfer(Origin::signed(BOB), ALICE, CLASS_ID, TOKEN_ID),
			Error::<Runtime>::NonTransferable
		);
	});
}

#[test]
fn burn_should_work() {
	let metadata = vec![1];
	let name = vec![1];
	let description = vec![1];
	let deposit_token = Nftmart::mint_token_deposit(metadata.len() as u32, 1).1;
	let deposit_class = Nftmart::create_class_deposit(metadata.len() as u32, name.len() as u32, description.len() as u32).1;
	ExtBuilder::default().build().execute_with(|| {
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata, name, description,
			Properties(ClassProperty::Transferable | ClassProperty::Burnable)
		));
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit_token).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			1
		));
		assert_eq!(
			reserved_balance(&class_id_account()),
			deposit_class.saturating_add(deposit_token)
		);
		assert_ok!(Nftmart::burn(Origin::signed(BOB), CLASS_ID, TOKEN_ID));
		let event = Event::nftmart_nft(crate::Event::BurnedToken(BOB, CLASS_ID, TOKEN_ID));
		assert_eq!(last_event(), event);

		assert_eq!(
			reserved_balance(&class_id_account()),
			deposit_class
		);
	});
}

#[test]
fn burn_should_fail() {
	let metadata = vec![1];
	let name = vec![1];
	let description = vec![1];
	let deposit_token = Nftmart::mint_token_deposit(metadata.len() as u32, 1).1;
	ExtBuilder::default().build().execute_with(|| {
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata.clone(), name.clone(), description.clone(),
			Properties(ClassProperty::Transferable | ClassProperty::Burnable)
		));
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit_token).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			1
		));
		assert_noop!(
			Nftmart::burn(Origin::signed(BOB), CLASS_ID, TOKEN_ID_NOT_EXIST),
			Error::<Runtime>::TokenIdNotFound
		);

		assert_noop!(
			Nftmart::burn(Origin::signed(ALICE), CLASS_ID, TOKEN_ID),
			Error::<Runtime>::NoPermission
		);

		orml_nft::Classes::<Runtime>::mutate(CLASS_ID, |class_info| {
			class_info.as_mut().unwrap().total_issuance = 0;
		});
		assert_noop!(
			Nftmart::burn(Origin::signed(BOB), CLASS_ID, TOKEN_ID),
			orml_nft::Error::<Runtime>::NumOverflow
		);
	});

	ExtBuilder::default().build().execute_with(|| {
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata.clone(), name.clone(), description.clone(),
			Default::default()
		));
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit_token).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			1
		));
		assert_noop!(
			Nftmart::burn(Origin::signed(BOB), CLASS_ID, TOKEN_ID),
			Error::<Runtime>::NonBurnable
		);
	});
}

#[test]
fn destroy_class_should_work() {
	let metadata = vec![1];
	let name = vec![1];
	let description = vec![1];
	let deposit_token = Nftmart::mint_token_deposit(metadata.len() as u32, 1).1;
	let deposit_class = Nftmart::create_class_deposit(metadata.len() as u32, name.len() as u32, description.len() as u32).1;
	ExtBuilder::default().build().execute_with(|| {
		assert_eq!(reserved_balance(&class_id_account()), 0);
		assert_eq!(free_balance(&class_id_account()), 0);
		assert_eq!(free_balance(&ALICE), 100000);

		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata, name, description,
			Properties(ClassProperty::Transferable | ClassProperty::Burnable)
		));
		assert_eq!(free_balance(&ALICE), 100000 - deposit_class);
		assert_eq!(free_balance(&class_id_account()), 0);
		assert_eq!(reserved_balance(&class_id_account()), deposit_class);
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit_token).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			1
		));
		assert_eq!(free_balance(&class_id_account()), 0);
		assert_eq!(reserved_balance(&class_id_account()), deposit_class.saturating_add(deposit_token));
		assert_ok!(Nftmart::burn(Origin::signed(BOB), CLASS_ID, TOKEN_ID));
		assert_eq!(reserved_balance(&class_id_account()), deposit_class);
		assert_eq!(free_balance(&class_id_account()), 0);
		assert_ok!(Nftmart::destroy_class(
			Origin::signed(class_id_account()),
			CLASS_ID,
			BOB
		));
		let event = Event::nftmart_nft(crate::Event::DestroyedClass(class_id_account(), CLASS_ID, BOB));
		assert_eq!(last_event(), event);
		assert_eq!(free_balance(&class_id_account()), 0);

		assert_eq!(reserved_balance(&class_id_account()), Proxy::deposit(1));

		let free_bob = deposit_class.saturating_add(deposit_token).saturating_sub(Proxy::deposit(1));
		assert_eq!(free_balance(&ALICE), 100000 - deposit_class);
		assert_eq!(free_balance(&BOB), free_bob);
	});
}

#[test]
fn destroy_class_should_fail() {
	let metadata = vec![1];
	let name = vec![1];
	let description = vec![1];
	let deposit_token = Nftmart::mint_token_deposit(metadata.len() as u32, 1).1;
	ExtBuilder::default().build().execute_with(|| {
		assert_ok!(Nftmart::create_class(
			Origin::signed(ALICE),
			metadata, name, description,
			Properties(ClassProperty::Transferable | ClassProperty::Burnable)
		));
		assert_eq!(Balances::deposit_into_existing(&class_id_account(), deposit_token).is_ok(), true);
		assert_ok!(Nftmart::mint(
			Origin::signed(class_id_account()),
			BOB,
			CLASS_ID,
			vec![1],
			1
		));
		assert_noop!(
			Nftmart::destroy_class(Origin::signed(class_id_account()), CLASS_ID_NOT_EXIST, BOB),
			Error::<Runtime>::ClassIdNotFound
		);

		assert_noop!(
			Nftmart::destroy_class(Origin::signed(BOB), CLASS_ID, BOB),
			Error::<Runtime>::NoPermission
		);

		assert_noop!(
			Nftmart::destroy_class(Origin::signed(class_id_account()), CLASS_ID, BOB),
			Error::<Runtime>::CannotDestroyClass
		);

		assert_ok!(Nftmart::burn(Origin::signed(BOB), CLASS_ID, TOKEN_ID));
		assert_ok!(Nftmart::destroy_class(
			Origin::signed(class_id_account()),
			CLASS_ID,
			BOB
		));
	});
}
