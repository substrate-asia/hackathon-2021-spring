mod compact;

use scale::{Decode, Encode};

use ink_env::Hash;
use ink_storage::traits::{PackedLayout, SpreadLayout};

pub use compact::Compact;

#[derive(
    PartialEq, Debug, Eq, Clone, Copy, Default, Encode, Decode, SpreadLayout, PackedLayout,
)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink_storage::traits::StorageLayout)
)]
pub struct BtcHeader {
    /// The protocol version. Should always be 1.
    pub version: u32,
    /// Reference to the previous block in the chain
    ///
    /// Indicating user-visible serializations of this hash should be backward.
    pub previous_header_hash: Hash,
    /// The root hash of the merkle tree of transactions in the block
    ///
    /// Indicating user-visible serializations of this hash should be backward.
    pub merkle_root_hash: Hash,
    /// The timestamp of the block, as claimed by the miner
    pub time: u32,
    /// The target value below which the block hash must lie, encoded as a
    /// a float (with well-defined rounding, of course)
    pub bits: Compact,
    /// The nonce, selected to obtain a low enough block hash
    pub nonce: u32,
}

impl BtcHeader {
    pub fn hash(&self) -> Hash {
        use ink_env::hash::CryptoHash;
        let mut output: [u8; 32] = Default::default();
        ink_env::hash::Sha2x256::hash(&self.serialize(), &mut output);
        let mut output2: [u8; 32] = Default::default();
        ink_env::hash::Sha2x256::hash(&output, &mut output2);
        // change to big-endian
        output2.reverse();
        output2.into()
    }

    pub fn serialize(&self) -> [u8; 80] {
        let mut buffer: [u8; 80] = [0_u8; 80];

        let mut point = 0;
        let mut next_point = 0;
        let mut f = |v: &[u8]| {
            next_point = point + v.len();
            (&mut buffer[point..next_point]).copy_from_slice(v);
            point = next_point;
        };

        let v = self.version.to_le_bytes();
        f(&v[..]);

        let v = self.previous_header_hash.as_ref();
        f(&v[..]);

        let v = self.merkle_root_hash.as_ref();
        f(&v[..]);

        let v = self.time.to_le_bytes();
        f(&v[..]);

        let bits: u32 = self.bits.into();
        let v = bits.to_le_bytes();
        f(&v[..]);

        let v = self.nonce.to_le_bytes();
        f(&v[..]);

        buffer
    }
}

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

impl BtcParams {
    pub fn new(
        max_bits: u32,
        block_max_future: u32,
        target_timespan_seconds: u32,
        target_spacing_seconds: u32,
        retargeting_factor: u32,
    ) -> BtcParams {
        Self {
            max_bits,
            block_max_future,

            target_timespan_seconds,
            target_spacing_seconds,
            retargeting_factor,

            retargeting_interval: target_timespan_seconds / target_spacing_seconds,
            min_timespan: target_timespan_seconds / retargeting_factor,
            max_timespan: target_timespan_seconds * retargeting_factor,
        }
    }
    pub fn max_bits(&self) -> Compact {
        Compact::new(self.max_bits)
    }
    pub fn block_max_future(&self) -> u32 {
        self.block_max_future
    }
    pub fn target_timespan_seconds(&self) -> u32 {
        self.target_timespan_seconds
    }

    pub fn retargeting_interval(&self) -> u32 {
        self.retargeting_interval
    }

    pub fn min_timespan(&self) -> u32 {
        self.min_timespan
    }
    pub fn max_timespan(&self) -> u32 {
        self.max_timespan
    }
}

pub fn hash_rev<T: AsMut<[u8]>>(mut hash: T) -> T {
    let bytes = hash.as_mut();
    bytes.reverse();
    hash
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::convert::TryFrom;
    /// `s` must be 66 (with 0x prefix) or 64 (without 0x prefix) chars
    fn h256(s: &str) -> Hash {
        let data = if let Some(hex) = s.strip_prefix("0x") {
            hex::decode(hex).unwrap()
        } else {
            hex::decode(s).unwrap()
        };
        Hash::try_from(&data[..]).unwrap()
    }

    fn h256_rev(s: &str) -> Hash {
        hash_rev(h256(s))
    }

    #[test]
    fn test_header() {
        let header = BtcHeader {
            version: 536870912,
            previous_header_hash: h256_rev(
                "0000000000000000000a4adf6c5192128535d4dcb56cfb5753755f8d392b26bf",
            ),
            merkle_root_hash: h256_rev(
                "1d21e60acb0b12e5cfd3f775edb647f982a2d666f9886b2f61ea5e72577b0f5e",
            ),
            time: 1558168296,
            bits: Compact::new(388627269),
            nonce: 1439505020,
        };
        let expect = "0000000000000000001721f58deb88b0710295a02551f0dde1e2e231a15f1882";
        let now = hex::encode(&header.hash());
        assert_eq!(&now, expect);
    }
}
