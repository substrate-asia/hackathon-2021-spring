use crate as mc_nft;
use crate::Module;
use frame_support::parameter_types;
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
  testing::Header,
  traits::{BlakeTwo256, IdentityLookup},
};

type UncheckedExtrinsic = frame_system::mocking::MockUncheckedExtrinsic<Test>;
type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
  pub enum Test where
    Block = Block,
    NodeBlock = Block,
    UncheckedExtrinsic = UncheckedExtrinsic,
  {
    System: frame_system::{Module, Call, Config, Storage, Event<T>},
    TemplateModule: mc_nft::{Module, Call, Storage, Event<T>},
  }
);

parameter_types! {
  pub const BlockHashCount: u64 = 250;
  pub const SS58Prefix: u8 = 42;
}

impl system::Config for Test {
  type BaseCallFilter = ();
  type BlockWeights = ();
  type BlockLength = ();
  type DbWeight = ();
  type Origin = Origin;
  type Call = Call;
  type Index = u64;
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
  type AccountData = ();
  type OnNewAccount = ();
  type OnKilledAccount = ();
  type SystemWeightInfo = ();
  type SS58Prefix = SS58Prefix;
}

parameter_types! {
  pub const MaxCommodities: u128 = 5;
  pub const MaxCommoditiesPerUser: u64 = 2;
  pub const DecayTime: u64 = 100;
}

impl mc_nft::Config for Test {
  type Event = Event;
  type CommodityAdmin = frame_system::EnsureRoot<Self::AccountId>;
  type CommodityInfo = Vec<u8>;
  type CommodityLimit = MaxCommodities;
  type UserCommodityLimit = MaxCommoditiesPerUser;
  type LifeTime = ();
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
  system::GenesisConfig::default()
    .build_storage::<Test>()
    .unwrap()
    .into()
}

pub type SUT = Module<Test>;
