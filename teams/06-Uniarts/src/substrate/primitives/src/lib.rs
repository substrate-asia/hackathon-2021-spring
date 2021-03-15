#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode};
use sp_runtime::{
    generic,
    traits::{IdentifyAccount, Verify, BlakeTwo256},
    MultiSignature, RuntimeDebug, OpaqueExtrinsic,
};

#[cfg(feature = "std")]
use serde::{Deserialize, Serialize};

/// An index to a block.
pub type BlockNumber = u32;

/// Alias to 512-bit hash when used in the context of a transaction signature on the chain.
pub type Signature = MultiSignature;

/// Alias to the public key used for this chain, actually a `MultiSigner`. Like the signature, this
/// also isn't a fixed size when encoded, as different cryptos have different size public keys.
pub type AccountPublic = <Signature as Verify>::Signer;

/// Some way of identifying an account on the chain. We intentionally make it equivalent
/// to the public key of our transaction signing scheme.
pub type AccountId = <<Signature as Verify>::Signer as IdentifyAccount>::AccountId;

/// The type for looking up accounts. We don't expect more than 4 billion of them, but you
/// never know...
pub type AccountIndex = u32;

/// Balance of an account.
pub type Balance = u128;

/// Signed version of Balance
pub type Amount = i128;

/// Index of a transaction in the chain.
pub type Index = u32;

/// A hash of some data used by the chain.
pub type Hash = sp_core::H256;

/// Index of a transaction in the relay chain. 32-bit should be plenty.
pub type Nonce = u32;

/// Digest item type.
pub type DigestItem = generic::DigestItem<Hash>;

/// Header type.
pub type Header = generic::Header<BlockNumber, BlakeTwo256>;

/// Block type.
pub type OpaqueBlock = generic::Block<Header, OpaqueExtrinsic>;

/// AuraId type.
pub type AuraId = sp_consensus_aura::sr25519::AuthorityId;

#[derive(Encode, Decode, Eq, PartialEq, Copy, Clone, RuntimeDebug, PartialOrd, Ord)]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
pub enum TokenSymbol {
    USDT = 0,
    DAI = 1,
}

#[derive(Encode, Decode, Eq, PartialEq, Copy, Clone, RuntimeDebug, PartialOrd, Ord)]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
pub enum CurrencyId {
    Native,
    UINK,
    DOT,
    KSM,
    ETH,
    Token(TokenSymbol),
}

#[ignore]
#[test]
fn print_module_account() {
    // --- substrate ---
    use sp_core::crypto::{set_default_ss58_version, Ss58AddressFormat, Ss58AddressFormat::*};
    use sp_runtime::{traits::AccountIdConversion, ModuleId};

    fn account_of(alias: [u8; 8], ss58_version: Ss58AddressFormat) {
        set_default_ss58_version(ss58_version);

        let alias_str = unsafe { core::str::from_utf8_unchecked(&alias) };
        let id = <ModuleId as AccountIdConversion<AccountId>>::into_account(&ModuleId(alias));

        eprintln!("{}:\n\t{}\n\t{:?}", alias_str, id, id);
    }

    // py/trsry:
    // 5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z
    // 6d6f646c70792f74727372790000000000000000000000000000000000000000 (5EYCAe5i...)
    account_of(*b"py/trsry", SubstrateAccount);

    // art/nftb:
    // 5EYCAe5fj5zwigs2Sr1KavTHcx1xfnpjUkN4SnAW9ngo8k4g
    // 6d6f646c6172742f6e6674620000000000000000000000000000000000000000 (5EYCAe5f...)
    account_of(*b"art/nftb", SubstrateAccount);

    // art/soci:
    // 5EYCAe5fj5zwiqofZc6Q2cXmZSJQm9kW7Q5e1np77Fyog5DQ
    // 6d6f646c6172742f736f63690000000000000000000000000000000000000000 (5EYCAe5f...)
    account_of(*b"art/soci", SubstrateAccount);

    // art/phre:
    // 5EYCAe5fj5zwikRqzNMCGpqMKcMNku4UHZTCpcGv2VmqWFAC
    // 6d6f646c6172742f706872650000000000000000000000000000000000000000 (5EYCAe5f...)
    account_of(*b"art/phre", SubstrateAccount);
}