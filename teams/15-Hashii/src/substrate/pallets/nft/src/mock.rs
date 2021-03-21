use crate::{Module, Trait};
use sp_core::H256;
use frame_support::{impl_outer_origin, impl_outer_event ,parameter_types, weights::Weight, traits::OnFinalize, traits::OnInitialize};
use sp_runtime::{
	traits::{BlakeTwo256, IdentityLookup}, testing::Header, Perbill,
};
use frame_system as system;

impl_outer_origin! {
	pub enum Origin for Test {}
}

mod nft_event {
	pub use crate::Event;
}
impl_outer_event! {
    pub enum TestEvent for Test {
		system<T>,
		nft_event<T>,
		pallet_balances<T>,
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

	pub const ExistentialDeposit: u64 = 1;
	pub const MinKeepBlockNumber: u64 = 1;
	pub const MaxKeepBlockNumber: u64 = 60 * 60 / 6 * 24 * 365;
	pub const MinimumPrice: u64 = 1;
	pub const MinimumVotingLock: u64 = 1;
	pub const FixRate: f64 = 0.2;
	pub const ProfitRate: f64 = 0.2;
	pub const DayBlockNum: u64 = 60 * 60 / 6 * 24;
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
	type Event = TestEvent;
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
impl pallet_balances::Trait for Test {
	type Balance = u64;
	type MaxLocks = ();
	type Event = TestEvent;
	type DustRemoval = ();
	type ExistentialDeposit = ExistentialDeposit;
	type AccountStore = system::Module<Test>;
	type WeightInfo = ();
}
type Balances = pallet_balances::Module<Test>;

impl Trait for Test {
	type Event = TestEvent;
	type MinKeepBlockNumber = MinKeepBlockNumber;
	type MaxKeepBlockNumber = MaxKeepBlockNumber;
	type MinimumPrice = MinimumPrice;
	type MinimumVotingLock = MinimumVotingLock;
	type FixRate = ();
	type ProfitRate = ();
	type DayBlockNum = ();
	type NftId = u32;
	type OrderId = u32;
	type Currency = Balances;
}

pub type NftModule = Module<Test>;
pub type System = frame_system::Module<Test>;

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
	let mut t = system::GenesisConfig::default()
		.build_storage::<Test>()
		.unwrap();
	pallet_balances::GenesisConfig::<Test> {
		balances: vec![(1, 10000), (2, 11000), (3, 12000), (4, 13000), (5, 14000)],
	}
		.assimilate_storage(&mut t)
		.unwrap();
	let mut ext: sp_io::TestExternalities = t.into();
	ext.execute_with(|| System::set_block_number(1));
	ext
}

pub fn run_to_block(n: u64) {
	while System::block_number() < n {
		NftModule::on_finalize(System::block_number());
		System::on_finalize(System::block_number());
		System::set_block_number(System::block_number() + 1);
		System::on_initialize(System::block_number());
		NftModule::on_initialize(System::block_number());
	}
}