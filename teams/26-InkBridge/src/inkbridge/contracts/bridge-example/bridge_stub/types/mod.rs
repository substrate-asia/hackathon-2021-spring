use scale::{Decode, Encode};

use ink_env::Hash;
use ink_prelude::vec::Vec;
use ink_storage::traits::{PackedLayout, SpreadLayout};
use light_bitcoin::chain::BlockHeader as BtcHeader;

#[derive(PartialEq, Debug, Eq, Clone, Copy, Encode, Decode, SpreadLayout, PackedLayout)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct BtcHeaderInfo {
    pub header: BtcHeader,
    pub height: u32,
}

#[derive(
    PartialEq, Debug, Eq, Clone, Copy, Default, Encode, Decode, SpreadLayout, PackedLayout,
)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct BtcHeaderIndex {
    pub hash: Hash,
    pub height: u32,
}

#[derive(PartialEq, Eq, Clone, Copy, Encode, Decode, Default, SpreadLayout, PackedLayout)]
#[cfg_attr(
    feature = "std",
    derive(Debug, scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct BtcParams {
    max_bits: u32,
    block_max_future: u32,

    target_timespan_seconds: u32,
    target_spacing_seconds: u32,
    retargeting_factor: u32,

    retargeting_interval: u32,
    min_timespan: u32,
    max_timespan: u32,
}
