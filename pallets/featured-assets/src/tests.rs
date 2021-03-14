#![cfg(test)]

use super::*;
use crate as mc_featured_assets;

use frame_support::{assert_ok, assert_noop, parameter_types};
use sp_core::H256;
use sp_runtime::{traits::{BlakeTwo256, IdentityLookup}, testing::Header};
use pallet_balances::Error as BalancesError;

type UncheckedExtrinsic = frame_system::mocking::MockUncheckedExtrinsic<Test>;
type Block = frame_system::mocking::MockBlock<Test>;

frame_support::construct_runtime!(
	pub enum Test where
		Block = Block,
		NodeBlock = Block,
		UncheckedExtrinsic = UncheckedExtrinsic,
	{
		System: frame_system::{Module, Call, Config, Storage, Event<T>},
		Balances: pallet_balances::{Module, Call, Storage, Config<T>, Event<T>},
		Assets: mc_featured_assets::{Module, Call, Storage, Event<T>},
	}
);

parameter_types! {
	pub const BlockHashCount: u64 = 250;
}
impl frame_system::Config for Test {
	type BaseCallFilter = ();
	type BlockWeights = ();
	type BlockLength = ();
	type DbWeight = ();
	type Origin = Origin;
	type Index = u64;
	type Call = Call;
	type BlockNumber = u64;
	type Hash = H256;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type Event = Event;
	type BlockHashCount = BlockHashCount;
	type Version = ();
	type PalletInfo = PalletInfo;
	type AccountData = pallet_balances::AccountData<u64>;
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
	type SS58Prefix = ();
}

parameter_types! {
	pub const ExistentialDeposit: u64 = 1;
}

impl pallet_balances::Config for Test {
	type MaxLocks = ();
	type Balance = u64;
	type DustRemoval = ();
	type Event = Event;
	type ExistentialDeposit = ExistentialDeposit;
	type AccountStore = System;
	type WeightInfo = ();
}

parameter_types! {
	pub const AssetDepositBase: u64 = 1;
	pub const AssetDepositPerZombie: u64 = 1;
	pub const StringLimit: u32 = 50;
	pub const MetadataDepositBase: u64 = 1;
	pub const MetadataDepositPerByte: u64 = 1;
}

impl Config for Test {
	type Currency = Balances;
	type Event = Event;
	type Balance = u64;
	type AssetId = u32;
	type ForceOrigin = frame_system::EnsureRoot<u64>;
	type AssetDepositBase = AssetDepositBase;
	type AssetDepositPerZombie = AssetDepositPerZombie;
	type StringLimit = StringLimit;
	type MetadataDepositBase = MetadataDepositBase;
	type MetadataDepositPerByte = MetadataDepositPerByte;
	type WeightInfo = ();
	type AssetAdmin = ();
	type RandomNumber = ();
}

pub(crate) fn new_test_ext() -> sp_io::TestExternalities {
	frame_system::GenesisConfig::default().build_storage::<Test>().unwrap().into()
}

#[test]
fn basic_minting_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_ok!(Assets::mint(Origin::signed(1), 0, 2, 100));
		assert_eq!(Assets::balance(0, 2), 100);
	});
}

#[test]
fn lifecycle_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&1, 100);
		assert_ok!(Assets::create(Origin::signed(1), 0, 10, 1, 10));
		assert_eq!(Balances::reserved_balance(&1), 11);
		assert!(Asset::<Test>::contains_key(0));

		assert_ok!(Assets::set_metadata(Origin::signed(1), 0, vec![0], vec![0], 12));
		assert_eq!(Balances::reserved_balance(&1), 14);
		assert!(Metadata::<Test>::contains_key(0));

		assert_ok!(Assets::mint(Origin::signed(1), 0, 10, 100));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 20, 100));
		assert_eq!(Account::<Test>::iter_prefix(0).count(), 2);

		assert_ok!(Assets::destroy(Origin::signed(1), 0, 100));
		assert_eq!(Balances::reserved_balance(&1), 0);

		assert!(!Asset::<Test>::contains_key(0));
		assert!(!Metadata::<Test>::contains_key(0));
		assert_eq!(Account::<Test>::iter_prefix(0).count(), 0);

		assert_ok!(Assets::create(Origin::signed(1), 0, 10, 1, 10));
		assert_eq!(Balances::reserved_balance(&1), 11);
		assert!(Asset::<Test>::contains_key(0));

		assert_ok!(Assets::set_metadata(Origin::signed(1), 0, vec![0], vec![0], 12));
		assert_eq!(Balances::reserved_balance(&1), 14);
		assert!(Metadata::<Test>::contains_key(0));

		assert_ok!(Assets::mint(Origin::signed(1), 0, 10, 100));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 20, 100));
		assert_eq!(Account::<Test>::iter_prefix(0).count(), 2);

		assert_ok!(Assets::force_destroy(Origin::root(), 0, 100));
		assert_eq!(Balances::reserved_balance(&1), 0);

		assert!(!Asset::<Test>::contains_key(0));
		assert!(!Metadata::<Test>::contains_key(0));
		assert_eq!(Account::<Test>::iter_prefix(0).count(), 0);
	});
}

#[test]
fn destroy_with_non_zombies_should_not_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&1, 100);
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_noop!(Assets::destroy(Origin::signed(1), 0, 100), Error::<Test>::RefsLeft);
		assert_noop!(Assets::force_destroy(Origin::root(), 0, 100), Error::<Test>::RefsLeft);
		assert_ok!(Assets::burn(Origin::signed(1), 0, 1, 100));
		assert_ok!(Assets::destroy(Origin::signed(1), 0, 100));
	});
}

#[test]
fn destroy_with_bad_witness_should_not_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&1, 100);
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 10, 100));
		assert_noop!(Assets::destroy(Origin::signed(1), 0, 0), Error::<Test>::BadWitness);
		assert_noop!(Assets::force_destroy(Origin::root(), 0, 0), Error::<Test>::BadWitness);
	});
}

#[test]
fn max_zombies_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 2, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 0, 100));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));

		assert_eq!(Assets::zombie_allowance(0), 0);
		assert_noop!(Assets::mint(Origin::signed(1), 0, 2, 100), Error::<Test>::TooManyZombies);
		assert_noop!(Assets::transfer(Origin::signed(1), 0, 2, 50), Error::<Test>::TooManyZombies);
		assert_noop!(Assets::force_transfer(Origin::signed(1), 0, 1, 2, 50), Error::<Test>::TooManyZombies);

		Balances::make_free_balance_be(&3, 100);
		assert_ok!(Assets::mint(Origin::signed(1), 0, 3, 100));

		assert_ok!(Assets::transfer(Origin::signed(0), 0, 1, 100));
		assert_eq!(Assets::zombie_allowance(0), 1);
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 50));
	});
}

#[test]
fn resetting_max_zombies_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 2, 1));
		Balances::make_free_balance_be(&1, 100);
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 2, 100));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 3, 100));

		assert_eq!(Assets::zombie_allowance(0), 0);

		assert_noop!(Assets::set_max_zombies(Origin::signed(1), 0, 1), Error::<Test>::TooManyZombies);

		assert_ok!(Assets::set_max_zombies(Origin::signed(1), 0, 3));
		assert_eq!(Assets::zombie_allowance(0), 1);
	});
}

#[test]
fn dezombifying_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 10));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::zombie_allowance(0), 9);

		// introduce a bit of balance for account 2.
		Balances::make_free_balance_be(&2, 100);

		// transfer 25 units, nothing changes.
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 25));
		assert_eq!(Assets::zombie_allowance(0), 9);

		// introduce a bit of balance; this will create the account.
		Balances::make_free_balance_be(&1, 100);

		// now transferring 25 units will create it.
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 25));
		assert_eq!(Assets::zombie_allowance(0), 10);
	});
}

#[test]
fn min_balance_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 10));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Asset::<Test>::get(0).unwrap().accounts, 1);

		// Cannot create a new account with a balance that is below minimum...
		assert_noop!(Assets::mint(Origin::signed(1), 0, 2, 9), Error::<Test>::BalanceLow);
		assert_noop!(Assets::transfer(Origin::signed(1), 0, 2, 9), Error::<Test>::BalanceLow);
		assert_noop!(Assets::force_transfer(Origin::signed(1), 0, 1, 2, 9), Error::<Test>::BalanceLow);

		// When deducting from an account to below minimum, it should be reaped.

		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 91));
		assert!(Assets::balance(0, 1).is_zero());
		assert_eq!(Assets::balance(0, 2), 100);
		assert_eq!(Asset::<Test>::get(0).unwrap().accounts, 1);

		assert_ok!(Assets::force_transfer(Origin::signed(1), 0, 2, 1, 91));
		assert!(Assets::balance(0, 2).is_zero());
		assert_eq!(Assets::balance(0, 1), 100);
		assert_eq!(Asset::<Test>::get(0).unwrap().accounts, 1);

		assert_ok!(Assets::burn(Origin::signed(1), 0, 1, 91));
		assert!(Assets::balance(0, 1).is_zero());
		assert_eq!(Asset::<Test>::get(0).unwrap().accounts, 0);
	});
}

#[test]
fn querying_total_supply_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 50));
		assert_eq!(Assets::balance(0, 1), 50);
		assert_eq!(Assets::balance(0, 2), 50);
		assert_ok!(Assets::transfer(Origin::signed(2), 0, 3, 31));
		assert_eq!(Assets::balance(0, 1), 50);
		assert_eq!(Assets::balance(0, 2), 19);
		assert_eq!(Assets::balance(0, 3), 31);
		assert_ok!(Assets::burn(Origin::signed(1), 0, 3, u64::max_value()));
		assert_eq!(Assets::total_supply(0), 69);
	});
}

#[test]
fn transferring_amount_below_available_balance_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 50));
		assert_eq!(Assets::balance(0, 1), 50);
		assert_eq!(Assets::balance(0, 2), 50);
	});
}

#[test]
fn transferring_frozen_user_should_not_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_ok!(Assets::freeze(Origin::signed(1), 0, 1));
		assert_noop!(Assets::transfer(Origin::signed(1), 0, 2, 50), Error::<Test>::Frozen);
		assert_ok!(Assets::thaw(Origin::signed(1), 0, 1));
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 50));
	});
}

#[test]
fn transferring_frozen_asset_should_not_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_ok!(Assets::freeze_asset(Origin::signed(1), 0));
		assert_noop!(Assets::transfer(Origin::signed(1), 0, 2, 50), Error::<Test>::Frozen);
		assert_ok!(Assets::thaw_asset(Origin::signed(1), 0));
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 50));
	});
}

#[test]
fn origin_guards_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_noop!(Assets::transfer_ownership(Origin::signed(2), 0, 2), Error::<Test>::NoPermission);
		// assert_noop!(Assets::set_team(Origin::signed(2), 0, 2, 2, 2), Error::<Test>::NoPermission);
		assert_noop!(Assets::freeze(Origin::signed(2), 0, 1), Error::<Test>::NoPermission);
		assert_noop!(Assets::thaw(Origin::signed(2), 0, 2), Error::<Test>::NoPermission);
		assert_noop!(Assets::mint(Origin::signed(2), 0, 2, 100), Error::<Test>::NoPermission);
		assert_noop!(Assets::burn(Origin::signed(2), 0, 1, 100), Error::<Test>::NoPermission);
		assert_noop!(Assets::force_transfer(Origin::signed(2), 0, 1, 2, 100), Error::<Test>::NoPermission);
		assert_noop!(Assets::set_max_zombies(Origin::signed(2), 0, 11), Error::<Test>::NoPermission);
		assert_noop!(Assets::destroy(Origin::signed(2), 0, 100), Error::<Test>::NoPermission);
	});
}

#[test]
fn transfer_owner_should_work() {
	new_test_ext().execute_with(|| {
		Balances::make_free_balance_be(&1, 100);
		Balances::make_free_balance_be(&2, 1);
		assert_ok!(Assets::create(Origin::signed(1), 0, 10, 1, 10));

		assert_eq!(Balances::reserved_balance(&1), 11);

		assert_ok!(Assets::transfer_ownership(Origin::signed(1), 0, 2));
		assert_eq!(Balances::reserved_balance(&2), 11);
		assert_eq!(Balances::reserved_balance(&1), 0);

		assert_noop!(Assets::transfer_ownership(Origin::signed(1), 0, 1), Error::<Test>::NoPermission);

		assert_ok!(Assets::transfer_ownership(Origin::signed(2), 0, 1));
		assert_eq!(Balances::reserved_balance(&1), 11);
		assert_eq!(Balances::reserved_balance(&2), 0);
	});
}

#[test]
fn set_team_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		// assert_ok!(Assets::set_team(Origin::signed(1), 0, 2, 3, 4));

		assert_ok!(Assets::mint(Origin::signed(2), 0, 2, 100));
		assert_ok!(Assets::freeze(Origin::signed(4), 0, 2));
		assert_ok!(Assets::thaw(Origin::signed(3), 0, 2));
		assert_ok!(Assets::force_transfer(Origin::signed(3), 0, 2, 3, 100));
		assert_ok!(Assets::burn(Origin::signed(3), 0, 3, 100));
	});
}

#[test]
fn transferring_to_frozen_account_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 2, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_eq!(Assets::balance(0, 2), 100);
		assert_ok!(Assets::freeze(Origin::signed(1), 0, 2));
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 50));
		assert_eq!(Assets::balance(0, 2), 150);
	});
}

#[test]
fn transferring_amount_more_than_available_balance_should_not_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_ok!(Assets::transfer(Origin::signed(1), 0, 2, 50));
		assert_eq!(Assets::balance(0, 1), 50);
		assert_eq!(Assets::balance(0, 2), 50);
		assert_ok!(Assets::burn(Origin::signed(1), 0, 1, u64::max_value()));
		assert_eq!(Assets::balance(0, 1), 0);
		assert_noop!(Assets::transfer(Origin::signed(1), 0, 1, 50), Error::<Test>::BalanceLow);
		assert_noop!(Assets::transfer(Origin::signed(2), 0, 1, 51), Error::<Test>::BalanceLow);
	});
}

#[test]
fn transferring_less_than_one_unit_should_not_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_noop!(Assets::transfer(Origin::signed(1), 0, 2, 0), Error::<Test>::AmountZero);
	});
}

#[test]
fn transferring_more_units_than_total_supply_should_not_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_noop!(Assets::transfer(Origin::signed(1), 0, 2, 101), Error::<Test>::BalanceLow);
	});
}

#[test]
fn burning_asset_balance_with_positive_balance_should_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 1), 100);
		assert_ok!(Assets::burn(Origin::signed(1), 0, 1, u64::max_value()));
		assert_eq!(Assets::balance(0, 1), 0);
	});
}

#[test]
fn burning_asset_balance_with_zero_balance_should_not_work() {
	new_test_ext().execute_with(|| {
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		assert_ok!(Assets::mint(Origin::signed(1), 0, 1, 100));
		assert_eq!(Assets::balance(0, 2), 0);
		assert_noop!(Assets::burn(Origin::signed(1), 0, 2, u64::max_value()), Error::<Test>::BalanceZero);
	});
}

#[test]
fn set_metadata_should_work() {
	new_test_ext().execute_with(|| {
		// Cannot add metadata to unknown asset
		assert_noop!(
			Assets::set_metadata(Origin::signed(1), 0, vec![0u8; 10], vec![0u8; 10], 12),
			Error::<Test>::Unknown,
		);
		assert_ok!(Assets::force_create(Origin::root(), 0, 1, 10, 1));
		// Cannot add metadata to unowned asset
		assert_noop!(
			Assets::set_metadata(Origin::signed(2), 0, vec![0u8; 10], vec![0u8; 10], 12),
			Error::<Test>::NoPermission,
		);

		// Cannot add oversized metadata
		assert_noop!(
			Assets::set_metadata(Origin::signed(1), 0, vec![0u8; 100], vec![0u8; 10], 12),
			Error::<Test>::BadMetadata,
		);
		assert_noop!(
			Assets::set_metadata(Origin::signed(1), 0, vec![0u8; 10], vec![0u8; 100], 12),
			Error::<Test>::BadMetadata,
		);

		// Successfully add metadata and take deposit
		Balances::make_free_balance_be(&1, 30);
		assert_ok!(Assets::set_metadata(Origin::signed(1), 0, vec![0u8; 10], vec![0u8; 10], 12));
		assert_eq!(Balances::free_balance(&1), 9);

		// Update deposit
		assert_ok!(Assets::set_metadata(Origin::signed(1), 0, vec![0u8; 10], vec![0u8; 5], 12));
		assert_eq!(Balances::free_balance(&1), 14);
		assert_ok!(Assets::set_metadata(Origin::signed(1), 0, vec![0u8; 10], vec![0u8; 15], 12));
		assert_eq!(Balances::free_balance(&1), 4);

		// Cannot over-reserve
		assert_noop!(
			Assets::set_metadata(Origin::signed(1), 0, vec![0u8; 20], vec![0u8; 20], 12),
			BalancesError::<Test, _>::InsufficientBalance,
		);

		// Clear Metadata
		assert!(Metadata::<Test>::contains_key(0));
		assert_ok!(Assets::set_metadata(Origin::signed(1), 0, vec![], vec![], 0));
		assert!(!Metadata::<Test>::contains_key(0));
	});
}
