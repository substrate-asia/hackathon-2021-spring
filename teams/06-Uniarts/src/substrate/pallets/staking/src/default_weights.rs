#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::weights::{Weight, constants::RocksDbWeight as DbWeight};

impl crate::WeightInfo for () {
	fn stake() -> Weight {
		(65949000 as Weight)
			.saturating_add(DbWeight::get().reads(5 as Weight))
			.saturating_add(DbWeight::get().writes(4 as Weight))
	}

	fn unstake() -> Weight {
		(65949000 as Weight)
			.saturating_add(DbWeight::get().reads(5 as Weight))
			.saturating_add(DbWeight::get().writes(3 as Weight))
	}
}