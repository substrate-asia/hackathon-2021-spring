use crate::{Error, mock::*};
use frame_support::{assert_ok, assert_noop};
use sp_core::H256;
use sp_runtime::traits::BadOrigin;
use super::RawEvent;

/// generate a Hash for indexing project
fn get_hash(value: u128) -> H256 {
	let slices = value.to_be_bytes();
	H256::from_slice(&slices.repeat(2))
}

fn last_event() -> RawEvent<u64, H256> {
	System::events().into_iter().map(|r| r.event)
		.filter_map(|e| {
			if let Event::quadratic_funding(inner) = e { Some(inner) } else { None }
		})
		.last()
		.unwrap()
}

#[test]
fn round_control_works() {
	new_test_ext().execute_with(|| {
		let round_id = 1;
		// make sure only AdminOrigin can start/end round
		assert_noop!(QuadraticFunding::start_round(Origin::signed(1), round_id), BadOrigin);
		assert_ok!(QuadraticFunding::start_round(Origin::root(), round_id));

		assert_noop!(QuadraticFunding::end_round(Origin::signed(1), round_id), BadOrigin);
		assert_ok!(QuadraticFunding::end_round(Origin::root(), round_id));
	});
}

#[test]
fn register_project_works() {
	new_test_ext().execute_with(|| {
		// IMPORTANT, event won't emit in block 0
		System::set_block_number(1);
		let hash = get_hash(1);
		let project_name = b"name".to_vec();
		let round_id = 1;
		// Dispatch a signed extrinsic.
		// should start round first
		assert_ok!(QuadraticFunding::start_round(Origin::root(), round_id));
		assert_ok!(QuadraticFunding::register_project(Origin::signed(1), round_id, hash, project_name.clone()));
		
		// Read pallet storage and assert an expected result.
		// positive case
		assert_eq!(QuadraticFunding::projects(round_id, hash).name, project_name);
		// negative case
		assert_noop!(
			QuadraticFunding::register_project(Origin::signed(1), round_id, hash, project_name),
			Error::<Test>::DuplicateProject
		);

		assert_eq!(Balances::free_balance(0), 1000);
		assert_ok!(QuadraticFunding::vote_cost(Origin::signed(1), round_id, hash, 1));
		assert_eq!(last_event(), RawEvent::VoteCost(hash,1));
	});
}

#[test]
fn donate_works() {
	new_test_ext().execute_with(|| {
		let round_id = 1;
		// Dispatch a signed extrinsic.
		// should start round first
		assert_ok!(QuadraticFunding::start_round(Origin::root(), round_id));
		assert_ok!(QuadraticFunding::donate(Origin::signed(0), round_id, 500));
		// make sure the source and dest balance is right
		assert_eq!(Balances::free_balance(0), 500);
		assert_eq!(Balances::free_balance(&QuadraticFunding::account_id()), 500);		
		// check the support pool
		assert_eq!(QuadraticFunding::rounds(round_id).pre_tax_support_pool, 500);
		// fee rate is 5%
		assert_eq!(QuadraticFunding::rounds(round_id).total_tax, 25);
		assert_eq!(QuadraticFunding::rounds(round_id).support_pool, 475);
	});
}

#[test]
fn vote_without_fund_works() {
	new_test_ext().execute_with(|| {
		let round_id = 1;
		assert_ok!(QuadraticFunding::start_round(Origin::root(), round_id));

		// initalize 3 projects
		for i in 1..4 {
			System::set_block_number(i);
			let hash = get_hash(i.into());
			let project_name = b"name".to_vec();
			assert_ok!(QuadraticFunding::register_project(Origin::signed(i), round_id, hash, project_name.clone()));
			assert_eq!(QuadraticFunding::projects(round_id, hash).name, project_name);

			// vote for each own's project only once, in this case there will be no fund
			let vote = 3;
			let expected_cost:u64 = vote * (vote + 1) / 2 * 100;
			assert_ok!(QuadraticFunding::vote(Origin::signed(i), round_id, hash, vote.into()));
			// We initialize the balance sequentially, each one got 1000*(i+1) pico
			assert_eq!(Balances::free_balance(i), 1000*(i+1) - expected_cost);
		}
		assert_ok!(QuadraticFunding::end_round(Origin::root(), round_id));
		// no support area means no fund expense
		assert_eq!(QuadraticFunding::rounds(round_id).total_support_area, 0);
	});
}


#[test]
fn vote_with_fund_works() {
	new_test_ext().execute_with(|| {
		let round_id = 1;
		assert_ok!(QuadraticFunding::start_round(Origin::root(), round_id));
		// sponsor default round
		assert_ok!(QuadraticFunding::donate(Origin::signed(0), round_id, 500));
		// initalize 3 projects
		for i in 1..4 {
			System::set_block_number(i);
			let hash = get_hash(i.into());
			let project_name = b"name".to_vec();
			assert_ok!(QuadraticFunding::register_project(Origin::signed(i), round_id, hash, project_name.clone()));
			assert_eq!(QuadraticFunding::projects(round_id, hash).name, project_name);

			// vote to each other, the area should be 3,3,12
			for j in 1..4 {
				let vote = if i > 2 {2} else {1};
				assert_ok!(QuadraticFunding::vote(Origin::signed(j), round_id, hash, vote));
			}
		}
		assert_eq!(QuadraticFunding::projects(round_id, get_hash(1)).support_area, 3);
		assert_eq!(QuadraticFunding::projects(round_id, get_hash(3)).support_area, 12);
		// total area is 18
		assert_eq!(QuadraticFunding::rounds(round_id).total_support_area, 18);
		
	});
}