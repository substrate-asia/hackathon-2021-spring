use sp_runtime::{
	RuntimeDebug,
	// traits::{
	// 	AtLeast32BitUnsigned, Zero, StaticLookup, Saturating, CheckedSub, CheckedAdd,
	// }
};
use sp_std::prelude::*;
use codec::{Encode, Decode};

// Asset 的组合特性
#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub enum FeatureHue {
	Green,
	Yellow,
	White,
	Black,
	Blue,
	Red,
	Orange,
	Pink,
	Purple
}
impl Into<u8> for FeatureHue {
	fn into(self) -> u8 {
		match self {
			Self::Green => 0x01,
			Self::Yellow => 0x02,
			Self::White => 0x03,
			Self::Black => 0x04,
			Self::Blue => 0x05,
			Self::Red => 0x06,
			Self::Orange => 0x07,
			Self::Pink => 0x08,
			Self::Purple => 0x09,
		}
	}
}
impl From<u8> for FeatureHue {
	fn from(num: u8) -> FeatureHue {
		let mod_num = (num % 0x09) + 1u8;
		match mod_num {
			0x01 => Self::Green,
			0x02 => Self::Yellow,
			0x03 => Self::White,
			0x04 => Self::Black,
			0x05 => Self::Blue,
			0x06 => Self::Red,
			0x07 => Self::Orange,
			0x08 => Self::Pink,
			_ => Self::Purple,
		}
	}
}
#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub enum FeatureElements {
	One(FeatureHue),
	Two(FeatureHue, FeatureHue),
	Three(FeatureHue, FeatureHue, FeatureHue),
	Four(FeatureHue, FeatureHue, FeatureHue, FeatureHue),
}
impl From<u32> for FeatureElements {
	fn from(num: u32) -> FeatureElements {
		let mut bytes = [0u8; 4];
		for i in 0..bytes.len() {
			bytes[i] = (num >> (8 * i)) as u8;
		}
		FeatureElements::from(&bytes)
	}
}
impl From<u16> for FeatureElements {
	fn from(num: u16) -> FeatureElements {
		let mut bytes = [0u8; 4];
		for i in 0..bytes.len() {
			bytes[i] = ((num >> (4 * i)) & 0x0F) as u8;
		}
		FeatureElements::from(&bytes)
	}
}
impl From<&[u8;4]> for FeatureElements {
	fn from(bytes: &[u8;4]) -> FeatureElements {
		if bytes[3] == 0u8 && bytes[2] == 0u8 && bytes[1] == 0u8 {
			FeatureElements::One(FeatureHue::from(bytes[0]))
		} else if bytes[3] == 0u8 && bytes[2] == 0u8 {
			FeatureElements::Two(FeatureHue::from(bytes[0]), FeatureHue::from(bytes[1]))
		} else if bytes[3] == 0u8 {
			FeatureElements::Three(FeatureHue::from(bytes[0]), FeatureHue::from(bytes[1]), FeatureHue::from(bytes[2]))
		} else {
			FeatureElements::Four(FeatureHue::from(bytes[0]), FeatureHue::from(bytes[1]), FeatureHue::from(bytes[2]), FeatureHue::from(bytes[3]))
		}
	}
}

impl Default for FeatureElements {
	fn default() -> Self { Self::One(FeatureHue::Green) }
}
#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub enum FeatureLevel {
	Lv0,
	Lv1,
	Lv2,
	Lv3,
	Lv4,
	Lv5,
}
impl From<u8> for FeatureLevel {
	fn from(num: u8) -> FeatureLevel {
		match num % 6 {
			0u8 => FeatureLevel::Lv0,
			1u8 => FeatureLevel::Lv1,
			2u8 => FeatureLevel::Lv2,
			3u8 => FeatureLevel::Lv3,
			4u8 => FeatureLevel::Lv4,
			_ => FeatureLevel::Lv5,
		}
	}
}
impl Into<u8> for FeatureLevel {
	fn into(self) -> u8 {
		match self {
			Self::Lv0 => 0u8,
			Self::Lv1 => 1u8,
			Self::Lv2 => 2u8,
			Self::Lv3 => 3u8,
			Self::Lv4 => 4u8,
			Self::Lv5 => 5u8,
		}
	}
}
impl Default for FeatureLevel {
	fn default() -> Self { Self::Lv0 }
}

#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub enum FeatureRankedLevel {
	Low(FeatureLevel),
	Middle(FeatureLevel),
	High(FeatureLevel),
}
impl From<u8> for FeatureRankedLevel {
	fn from(num: u8) -> FeatureRankedLevel {
		let level_value = num & 0x0F;
		// 0x0(rank) 0(level)
		// first is rank
		match ((num >> 4) as u8) % 3 {
			0u8 => FeatureRankedLevel::Low(FeatureLevel::from(level_value)),
			1u8 => FeatureRankedLevel::Middle(FeatureLevel::from(level_value)),
			_ => FeatureRankedLevel::High(FeatureLevel::from(level_value)),
		}
	}
}
impl Default for FeatureRankedLevel {
	fn default() -> Self { Self::Low(FeatureLevel::Lv0) }
}

#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug)]
pub enum FeatureDestinyRank {
	Tian,
	Di,
	Xuan,
	Huang,
}
impl From<u8> for FeatureDestinyRank {
	fn from(num: u8) -> FeatureDestinyRank {
		match num % 4 {
			0 => FeatureDestinyRank::Huang,
			1 => FeatureDestinyRank::Xuan,
			2 => FeatureDestinyRank::Di,
			_ => FeatureDestinyRank::Tian,
		}
	}
}
impl Into<u8> for FeatureDestinyRank {
	fn into(self) -> u8 {
		match self {
			FeatureDestinyRank::Huang => 0,
			FeatureDestinyRank::Xuan => 1,
			FeatureDestinyRank::Di => 2,
			FeatureDestinyRank::Tian => 3,
		}
	}
}
impl Default for FeatureDestinyRank {
	fn default() -> Self { Self::Huang }
}
