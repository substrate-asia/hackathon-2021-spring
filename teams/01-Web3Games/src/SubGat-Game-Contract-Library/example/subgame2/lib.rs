#![cfg_attr(not(feature = "std"), no_std)]

use ink_env::Environment;
use ink_lang as ink;
use ink_prelude::{
    vec::Vec,
};

type AccountId = <ink_env::DefaultEnvironment as Environment>::AccountId;
type Balance = <ink_env::DefaultEnvironment as Environment>::Balance;
type TokenId = u64;
type InstanceId = u64;

/// Define the operations to interact with the substrate runtime
#[ink::chain_extension]
pub trait Erc1155 {
    type ErrorCode = Error;

    // #[ink(extension = 1001, returns_result = false)]
    // fn fetch_random() -> [u8; 32];

    #[ink(extension = 1002, returns_result = false)]
    fn create_instance(who: AccountId, data: Vec<u8>) -> InstanceId;

    #[ink(extension = 1003, returns_result = false)]
    fn create_token(who: AccountId, instance_id: InstanceId, token_id: TokenId, is_nf: bool, uri: Vec<u8>);

    #[ink(extension = 1004, returns_result = false)]
    fn set_approval_for_all(owner: AccountId, operator: AccountId, instance_id: InstanceId, approved: bool);

    #[ink(extension = 1005, returns_result = false)]
    fn mint(to: AccountId, instance_id: InstanceId, token_id: TokenId, amount: Balance);

    #[ink(extension = 1006, returns_result = false)]
    fn batch_mint(to: AccountId, instance_id: InstanceId, token_ids : Vec<TokenId>, amounts: Vec<Balance>);

    #[ink(extension = 1007, returns_result = false)]
    fn burn(from: AccountId, instance_id: InstanceId, token_id: TokenId, amount: Balance);

    #[ink(extension = 1008, returns_result = false)]
    fn batch_burn(from: AccountId, instance_id: InstanceId, token_ids: Vec<TokenId>, amounts: Vec<Balance>);

    #[ink(extension = 1009, returns_result = false)]
    fn transfer_from(from: AccountId, to: AccountId, instance_id: InstanceId, token_id: TokenId, amount: Balance);

    #[ink(extension = 1010, returns_result = false)]
    fn batch_transfer_from(from: AccountId, to: AccountId, instance_id: InstanceId, token_ids: Vec<TokenId>, amounts: Vec<Balance>);

    // #[ink(extension = 1011, returns_result = false)]
    // fn approved_or_owner(who: AccountId, account: AccountId) -> bool;

    #[ink(extension = 1012, returns_result = false)]
    fn is_approved_for_all(owner: AccountId, operator: AccountId, instance_id: InstanceId) -> bool;

    #[ink(extension = 1013, returns_result = false)]
    fn balance_of(owner: AccountId, instance_id: InstanceId, token_id: TokenId)  -> Balance;

    #[ink(extension = 1014, returns_result  = false)]
    fn balance_of_batch(owners: Vec<AccountId>, instance_id: InstanceId, token_ids: Vec<TokenId>) -> Vec<Balance>;

    #[ink(extension = 1015, returns_result  = false)]
    fn balance_of_single_owner_batch(owners: AccountId, instance_id: InstanceId, token_ids: Vec<TokenId>) -> Vec<Balance>;

}

#[derive(Debug, Copy, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum Error {
    FailGetErc1155,
    OnlyOwner,
}

impl ink_env::chain_extension::FromStatusCode for Error {
    fn from_status_code(status_code: u32) -> Result<(), Self> {
        match status_code {
            0 => Ok(()),
            1 => Err(Self::FailGetErc1155),
            _ => panic!("encountered unknown status code"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum CustomEnvironment {}

impl Environment for CustomEnvironment {
    const MAX_EVENT_TOPICS: usize =
        <ink_env::DefaultEnvironment as Environment>::MAX_EVENT_TOPICS;

    type AccountId = <ink_env::DefaultEnvironment as Environment>::AccountId;
    type Balance = <ink_env::DefaultEnvironment as Environment>::Balance;
    type Hash = <ink_env::DefaultEnvironment as Environment>::Hash;
    type BlockNumber = <ink_env::DefaultEnvironment as Environment>::BlockNumber;
    type Timestamp = <ink_env::DefaultEnvironment as Environment>::Timestamp;

    type ChainExtension = Erc1155;
}

#[ink::contract(env = crate::CustomEnvironment)]
mod subgame2 {
    use super::Error;
    use crate::{Vec, TokenId, InstanceId};
    use ink_storage::collections::{
        HashMap as StorageHashMap,
    };

    #[ink(storage)]
    pub struct Subgame2 {
        instance_id: InstanceId,
        owner: AccountId,
        token_uri: StorageHashMap<TokenId, Vec<u8>>,
    }

    #[ink(event)]
    pub struct TokenCreated {
        #[ink(topic)]
        creator: AccountId,
        id: TokenId,
        is_nf: bool,
        uri: Vec<u8>,
    }

    #[ink(event)]
    pub struct URI {
        value: Vec<u8>,
        id: TokenId,
    }

    impl Subgame2 {
        /// Creates a new Subgame2 contract.
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            let instance_id = Self::env().extension().create_instance(caller, [].to_vec()).unwrap();

            Self {
                instance_id,
                owner: caller,
                token_uri: Default::default(),
            }
        }

        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        #[ink(message)]
        pub fn create_token(&mut self, token_id: TokenId, is_nf: bool, uri: Vec<u8>) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::OnlyOwner);
            }

            self.env().extension().create_token(caller, self.instance_id, token_id, is_nf, uri.clone())?;
            self.token_uri.insert(token_id, uri.clone());

            self.env().emit_event(TokenCreated {
                creator: caller,
                id: token_id,
                is_nf,
                uri,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn uri_of(&self, token_id: TokenId) -> Option<Vec<u8>> {
            self.token_uri.get(&token_id).cloned()
        }

        #[ink(message)]
        pub fn set_uri(&mut self, token_id: TokenId, uri: Vec<u8>) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::OnlyOwner);
            }

            self.token_uri.insert(token_id, uri.clone());

            self.env().emit_event(URI {
                value: uri,
                id: token_id,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn set_approval_for_all(&mut self, operator: AccountId, approved: bool) -> Result<(), Error> {
            let caller = self.env().caller();

            self.env().extension().set_approval_for_all(caller, operator, self.instance_id, approved)?;

            Ok(())
        }

        #[ink(message)]
        pub fn is_approved_for_all(&mut self, owner: AccountId, operator: AccountId) -> Result<bool, Error> {
            let approved = self.env().extension().is_approved_for_all(owner, operator, self.instance_id)?;

            Ok(approved)
        }

        #[ink(message)]
        pub fn mint(&mut self, to: AccountId, token_id: TokenId, amount: Balance) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::OnlyOwner);
            }

            self.env().extension().mint(to, self.instance_id, token_id, amount)?;

            Ok(())
        }

        #[ink(message)]
        pub fn batch_mint(&mut self, to: AccountId, token_ids : Vec<TokenId>, amounts: Vec<Balance>) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::OnlyOwner);
            }

            self.env().extension().batch_mint(to, self.instance_id, token_ids, amounts)?;

            Ok(())
        }

        #[ink(message)]
        pub fn burn(&mut self, from: AccountId, token_id: TokenId, amount: Balance) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::OnlyOwner);
            }

            self.env().extension().burn(from, self.instance_id, token_id, amount)?;

            Ok(())
        }

        #[ink(message)]
        pub fn batch_burn(&mut self, from: AccountId, token_ids: Vec<TokenId>, amounts: Vec<Balance>) -> Result<(), Error> {
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::OnlyOwner);
            }

            self.env().extension().batch_burn(from, self.instance_id, token_ids, amounts)?;

            Ok(())
        }

        #[ink(message)]
        pub fn transfer_from(&mut self, from: AccountId, to: AccountId, token_id: TokenId, amount: Balance) -> Result<(), Error> {
            self.env().extension().transfer_from(from, to, self.instance_id, token_id, amount)?;

            Ok(())
        }

        #[ink(message)]
        pub fn batch_transfer_from(&mut self, from: AccountId, to: AccountId, token_ids: Vec<TokenId>, amounts: Vec<Balance>) -> Result<(), Error> {
            self.env().extension().batch_transfer_from(from, to, self.instance_id, token_ids,  amounts)?;

            Ok(())
        }

        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId, token_id: TokenId) -> Result<Balance, Error> {
            let balance = self.env().extension().balance_of(owner, self.instance_id, token_id)?;

            Ok(balance)
        }

        #[ink(message)]
        pub fn balance_of_batch(&self, owners: Vec<AccountId>, token_ids: Vec<TokenId>) -> Result<Vec<Balance>, Error> {
            let balances = self.env().extension().balance_of_batch(owners, self.instance_id, token_ids)?;

            Ok(balances)
        }

        #[ink(message)]
        pub fn balance_of_single_owner_batch(&self, owners: AccountId, token_ids: Vec<TokenId>) -> Result<Vec<Balance>, Error> {
            let balances = self.env().extension().balance_of_single_owner_batch(owners, self.instance_id, token_ids)?;

            Ok(balances)
        }


    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[test]
        fn default_works() {
            let subgame2 = Subgame2::default();
            assert_eq!(subgame2.get(), false);
        }

        /// We test a simple use case of our contract.
        #[test]
        fn it_works() {
            let mut subgame2 = Subgame2::new(false);
            assert_eq!(subgame2.get(), false);
            subgame2.flip();
            assert_eq!(subgame2.get(), true);
        }
    }
}
