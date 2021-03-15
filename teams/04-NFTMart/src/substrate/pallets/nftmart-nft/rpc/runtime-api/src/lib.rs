#![cfg_attr(not(feature = "std"), no_std)]

pub use sp_core::constants_types::Balance;
pub use sp_std::vec::Vec;
pub use nftmart_nft::NFTMetadata;

sp_api::decl_runtime_apis! {
	/// The helper API to calculate deposit.
	pub trait NFTMartApi {
		/// mint_token_deposit
		fn mint_token_deposit(metadata_len: u32, quantity: u32) -> (Balance, Balance);
		/// add_class_admin_deposit
		fn add_class_admin_deposit(admin_count: u32) -> Balance;
		/// create_class_deposit
		fn create_class_deposit(metadata_len: u32, name_len: u32, description_len: u32) -> (Balance, Balance);
	}
}
