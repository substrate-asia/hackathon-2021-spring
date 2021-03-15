use mc_support::traits::{ LifeTime };
use super::primitives::{ BlockNumber };

pub struct DemoActor;

impl LifeTime<BlockNumber> for DemoActor {
	fn base_age(level: u32) -> BlockNumber {
		// TODO
		0
	}
}

pub struct DemoItem;

impl LifeTime<BlockNumber> for DemoItem {
	fn base_age(_: u32) -> BlockNumber {
		10_000_000
	}
}
