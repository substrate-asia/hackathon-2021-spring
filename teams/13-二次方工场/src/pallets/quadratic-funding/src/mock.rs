use crate::{Module, Trait};
use frame_system as system;
use sp_core::H256;
use frame_support::{impl_outer_origin, impl_outer_event, parameter_types, weights::Weight};
use sp_runtime::{
	Perbill, ModuleId,
	testing::Header,
	traits::{BlakeTwo256, IdentityLookup},
};

impl_outer_origin! {
	pub enum Origin for Test {}
}

mod quadratic_funding {
	pub use crate::Event;
}

impl_outer_event! {
	pub enum Event for Test {
		system<T>,
		pallet_balances<T>,
		quadratic_funding<T>,
	}
}

// Configure a mock runtime to test the pallet.
#[derive(Clone, Eq, PartialEq)]
pub struct Test;
parameter_types! {
	pub const BlockHashCount: u64 = 250;
	pub const MaximumBlockWeight: Weight = 1024;
	pub const MaximumBlockLength: u32 = 2 * 1024;
	pub const AvailableBlockRatio: Perbill = Perbill::from_percent(75);
}

parameter_types! {
	// for testing, set unit to pico
    pub const VoteUnit: u128 = 1;
	// The base of unit per vote, should be 100 pico of token for each vote
    pub const NumberOfUnit: u128 = 100;
    // The ratio of fee for each trans, final value should be FeeRatio/NumberOfUnit
    pub const FeeRatio: u128 = 5;
	pub const QuadraticFundingModuleId: ModuleId = ModuleId(*b"py/quafd");
	pub const NameMinLength: usize = 3;
	pub const NameMaxLength: usize = 32;
}

impl system::Trait for Test {
	type BaseCallFilter = ();
	type Origin = Origin;
	type Call = ();
	type Index = u64;
	type BlockNumber = u64;
	type Hash = H256;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type Event = Event;
	type BlockHashCount = BlockHashCount;
	type MaximumBlockWeight = MaximumBlockWeight;
	type DbWeight = ();
	type BlockExecutionWeight = ();
	type ExtrinsicBaseWeight = ();
	type MaximumExtrinsicWeight = MaximumBlockWeight;
	type MaximumBlockLength = MaximumBlockLength;
	type AvailableBlockRatio = AvailableBlockRatio;
	type Version = ();
	type PalletInfo = ();
	type AccountData = pallet_balances::AccountData<u64>;
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
}

parameter_types! {
	pub const ExistentialDeposit: u64 = 1;
}
impl pallet_balances::Trait for Test {
	type MaxLocks = ();
	type Balance = u64;
	type Event = Event;
	type DustRemoval = ();
	type ExistentialDeposit = ExistentialDeposit;
	type AccountStore = System;
	type WeightInfo = ();
}

impl Trait for Test {
	type ModuleId = QuadraticFundingModuleId;
    // The Balances pallet implements the ReservableCurrency trait.
    // https://substrate.dev/rustdocs/v2.0.0/pallet_balances/index.html#implementations-2
    type Currency = pallet_balances::Module<Test>;

    // Use the UnitOfVote from the parameter_types block.
    type UnitOfVote = VoteUnit;

    // No action is taken when deposits are forfeited.
    type Slashed = ();

    // Use the MinNickLength from the parameter_types block.
    type NumberOfUnitPerVote = NumberOfUnit;

    // Use the FeeRatio from the parameter_types block.
    type FeeRatioPerVote = FeeRatio;

	type Event = Event;

	type AdminOrigin = frame_system::EnsureRoot<u64>;

	// The minimum length of project name
	type NameMinLength = NameMinLength;

	// The maximum length of project name
	type NameMaxLength = NameMaxLength;
}

pub type System = frame_system::Module<Test>;
pub type Balances = pallet_balances::Module<Test>;
pub type QuadraticFunding = Module<Test>;

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
	// system::GenesisConfig::default().build_storage::<Test>().unwrap().into()
	let mut t = system::GenesisConfig::default().build_storage::<Test>().unwrap();
	pallet_balances::GenesisConfig::<Test>{
		// Total issuance will be 200 with treasury account initialized at ED.
		balances: vec![(0, 1000), (1, 2000), (2, 3000), (3, 4000)],
	}.assimilate_storage(&mut t).unwrap();
	system::GenesisConfig::default().assimilate_storage::<Test>(&mut t).unwrap();
	t.into()
}