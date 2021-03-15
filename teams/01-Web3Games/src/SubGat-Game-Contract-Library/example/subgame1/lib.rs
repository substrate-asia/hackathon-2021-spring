#![cfg_attr(not(feature = "std"), no_std)]

// pub use self::erc1155::{Erc1155, TokenId, TokenBalance};
use ink_lang as ink;
use ink_prelude::{
    vec::Vec,
};

#[ink::contract]
pub mod subgame1 {
    use ink_storage::collections::{
        HashMap as StorageHashMap,
    };
    use scale::{Encode, Decode};
    use crate::Vec;

    pub type TokenId = u32;
    pub type TokenBalance = u128;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct Subgame1 {
        balances: StorageHashMap<(AccountId, TokenId), TokenBalance>,
        operator_approvals: StorageHashMap<(AccountId, AccountId), bool>,

        next_token_id: TokenId,
        token_creator: StorageHashMap<TokenId, AccountId>,
        token_uri: StorageHashMap<TokenId, Vec<u8>>,
    }

    #[ink(event)]
    pub struct TransferSingle {
        operator: AccountId,
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        id: TokenId,
        value: TokenBalance,
    }

    #[ink(event)]
    pub struct TransferBatch {
        operator: AccountId,
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        ids: Vec<TokenId>,
        values: Vec<TokenBalance>,
    }

    #[ink(event)]
    pub struct ApprovalForAll {
        #[ink(topic)]
        account: AccountId,
        #[ink(topic)]
        operator: AccountId,
        approved: bool,
    }

    #[ink(event)]
    pub struct URI {
        value: Vec<u8>,
        id: TokenId,
    }

    #[ink(event)]
    pub struct TokenCreated {
        #[ink(topic)]
        creator: AccountId,
        id: TokenId,
        uri: Vec<u8>,
    }

    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature="std", derive(scale_info::TypeInfo))]
    pub enum Error {
        InsufficientBalance,
        ApprovalForSelf,
        InvalidArrayLength,
        CannotFetchValue,
        OnlyCreator,
        NotApproved,
    }

    impl Subgame1 {
        /// Creates a new Subgame1 contract.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                balances: StorageHashMap::new(),
                operator_approvals: StorageHashMap::new(),
                next_token_id: TokenId::from(1u32),
                token_creator: StorageHashMap::new(),
                token_uri: StorageHashMap::new(),
            }
        }

        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }

        #[ink(message)]
        pub fn create(&mut self, uri: Vec<u8>) -> Result<(), Error> {
            let caller = self.env().caller();
            let id = self.next_token_id;

            self.token_creator.insert(id, caller);
            self.token_uri.insert(id, uri.clone());
            self.next_token_id = id + 1;

            self.env().emit_event(TokenCreated {
                creator: caller,
                id,
                uri,
            });

            Ok(())
        }

        /// Returns the creator of the token.
        #[ink(message)]
        pub fn creator_of(&self, id: TokenId) -> Option<AccountId> {
            self.token_creator.get(&id).cloned()
        }

        /// Returns the uri of the token.
        #[ink(message)]
        pub fn uri_of(&self, id: TokenId) -> Option<Vec<u8>> {
            self.token_uri.get(&id).cloned()
        }

        #[ink(message)]
        pub fn set_uri(&mut self, id: TokenId, uri: Vec<u8>) -> Result<(), Error> {
            let caller = self.env().caller();
            if !self.is_creator(caller, id) {
                return Err(Error::OnlyCreator);
            }

            self.token_uri.insert(id, uri.clone());

            self.env().emit_event(URI {
                value: uri,
                id,
            });

            Ok(())
        }

        /// Get the balance of an account's Tokens
        #[ink(message)]
        pub fn balance_of(&self, account: AccountId, id: TokenId) -> TokenBalance {
            self.balance_of_or_zero(&account, &id)
        }

        /// Get the balance of multiple account/token pairs
        #[ink(message)]
        pub fn balance_of_batch(&self, accounts: Vec<AccountId>, ids: Vec<TokenId>) -> Result<Vec<TokenBalance>, Error> {
            if accounts.len() != ids.len() {
                return Err(Error::InvalidArrayLength);
            }

            let mut batch_balances: Vec<TokenBalance> = Vec::new();

            for i in 0..accounts.len() {
                batch_balances.push(self.balance_of_or_zero(&accounts[i], &ids[i]));
            }

            Ok(batch_balances)
        }

        /// Grants or revokes permission to `operator` to transfer the caller's tokens, according to `approved`.
        /// Emits an {ApprovalForAll} event.
        #[ink(message)]
        pub fn set_approval_for_all(&mut self, operator: AccountId, approved: bool) -> Result<(), Error> {
            let caller = self.env().caller();

            if operator == caller {
                return Err(Error::ApprovalForSelf);
            }

            if self.approved_for_all(&caller, &operator) {
                let status = self
                    .operator_approvals
                    .get_mut(&(caller, operator))
                    .ok_or(Error::CannotFetchValue)?;
                *status = approved;
            } else {
                self.operator_approvals.insert((caller, operator), approved);
            }

            self.env().emit_event(ApprovalForAll {
                account: caller,
                operator,
                approved,
            });

            Ok(())
        }

        /// Returns true if `operator` is approved to transfer ``account``'s tokens.
        #[ink(message)]
        pub fn is_approved_for_all(&self, account: AccountId, operator: AccountId) -> bool {
            self.approved_for_all(&account, &operator)
        }

        /// Transfers `value` tokens of token type `id` from `from` to `to`.
        #[ink(message)]
        pub fn safe_transfer_from(&mut self, from: AccountId, to: AccountId, id: TokenId, value: TokenBalance) -> Result<(), Error> {
            let caller = self.env().caller();

            if !self.approved_or_owner(from, caller) {
                return Err(Error::NotApproved);
            }

            self.transfer_token_from(&from, &to, &id, value)?;

            self.env().emit_event(TransferSingle {
                operator: caller,
                from,
                to,
                id,
                value,
            });

            Ok(())
        }

        /// Send multiple types of Tokens from `from` to `to`.
        #[ink(message)]
        pub fn safe_batch_transfer_from(&mut self, from: AccountId, to: AccountId, ids: Vec<TokenId>, values: Vec<TokenBalance>) -> Result<(), Error> {
            let caller = self.env().caller();

            if ids.len() != values.len() {
                return Err(Error::InvalidArrayLength);
            }

            if !self.approved_or_owner(from, caller) {
                return Err(Error::NotApproved);
            }

            for i in 0..ids.len() {
                let id = ids[i];
                let value = values[i];

                self.transfer_token_from(&from, &to, &id, value)?;
            }

            self.env().emit_event(TransferBatch {
                operator: caller,
                from,
                to,
                ids,
                values,
            });

            Ok(())
        }

        /// Creates `value` tokens of token type `id`, and assigns them to `account`.
        #[ink(message)]
        pub fn mint(&mut self, to: AccountId, id: TokenId, value: TokenBalance) -> Result<(), Error> {
            let caller = self.env().caller();

            if !self.is_creator(caller, id) {
                return Err(Error::OnlyCreator);
            }

            if to == AccountId::from([0x0; 32]) {
                return Err(Error::NotApproved);
            }

            self.add_token_to(&to, &id, value)?;

            self.env().emit_event(TransferSingle {
                operator: caller,
                from: AccountId::from([0x0; 32]),
                to,
                id,
                value,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn mint_batch(&mut self, to: AccountId, ids: Vec<TokenId>, values: Vec<TokenBalance>) -> Result<(), Error> {
            let caller = self.env().caller();

            if to == AccountId::from([0x0; 32]) {
                return Err(Error::NotApproved);
            }

            if ids.len() != values.len() {
                return Err(Error::InvalidArrayLength);
            }

            for i in 0..ids.len() {
                let id = ids[i];
                let value = values[i];
                
                if !self.is_creator(caller, id) {
                    return Err(Error::OnlyCreator);
                }

                self.add_token_to(&to, &id, value)?;
            }

            self.env().emit_event(TransferBatch {
                operator: caller,
                from: AccountId::from([0x0; 32]),
                to,
                ids,
                values,
            });

            Ok(())
        }

        /// Destroys `value` tokens of token type `id` from `account`
        #[ink(message)]
        pub fn burn(&mut self, from: AccountId, id: TokenId, value: TokenBalance) -> Result<(), Error> {
            let caller = self.env().caller();

            if !self.is_creator(caller, id) {
                return Err(Error::OnlyCreator);
            }

            if from == AccountId::from([0x0; 32]) {
                return Err(Error::NotApproved);
            }

            self.remove_token_from(&from, &id, value)?;

            self.env().emit_event(TransferSingle {
                operator: caller,
                from,
                to: AccountId::from([0x0; 32]),
                id,
                value,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn burn_batch(&mut self, from: AccountId, ids: Vec<TokenId>, values: Vec<TokenBalance>) -> Result<(), Error> {
            let caller = self.env().caller();

            if from == AccountId::from([0x0; 32]) {
                return Err(Error::NotApproved);
            }

            if ids.len() != values.len() {
                return Err(Error::InvalidArrayLength);
            }

            for i in 0..ids.len() {
                let id = ids[i];
                let value = values[i];

                if !self.is_creator(caller, id) {
                    return Err(Error::OnlyCreator);
                }

                self.remove_token_from(&from, &id, value)?;
            }

            self.env().emit_event(TransferBatch {
                operator: caller,
                from,
                to: AccountId::from([0x0; 32]),
                ids,
                values,
            });

            Ok(())
        }

        fn transfer_token_from(&mut self, from: &AccountId, to: &AccountId, id: &TokenId, value: TokenBalance) -> Result<(), Error> {
            self.remove_token_from(from, id, value)?;
            self.add_token_to(to, id, value)?;

            Ok(())
        }

        fn add_token_to(&mut self, to: &AccountId, id: &TokenId, value: TokenBalance) -> Result<(), Error> {
            let to_balance = self.balance_of_or_zero(&to, &id);
            self.balances.insert((*to, *id), to_balance + value);

            Ok(())
        }

        fn remove_token_from(&mut self, from: &AccountId, id: &TokenId, value: TokenBalance) -> Result<(), Error> {
            let from_balance = self.balance_of_or_zero(from, id);
            if from_balance < value {
                return Err(Error::InsufficientBalance);
            }

            self.balances.insert((*from, *id), from_balance - value);

            Ok(())
        }

        fn approved_or_owner(&self, account: AccountId, caller: AccountId) -> bool {
            account != AccountId::from([0x0; 32])
                && (account == caller || self.approved_for_all(&account, &caller))
        }

        fn is_creator(&self, caller: AccountId, id: TokenId) -> bool {
            self.token_creator.get(&id) == Some(&caller)
        }

        fn balance_of_or_zero(&self, account: &AccountId, id: &TokenId) -> TokenBalance {
            *self.balances.get(&(*account, *id)).unwrap_or(&0)
        }

        fn approved_for_all(&self, account: &AccountId, operator: &AccountId) -> bool {
            *self.operator_approvals.get(&(*account, *operator)).unwrap_or(&false)
        }

        /// Returns true if token `id` exists or false if it does not.
        fn exists(&self, id: TokenId) -> bool {
            self.token_creator.get(&id).is_some() && self.token_creator.contains_key(&id)
        }

    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn create_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.creator_of(1), None);
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.creator_of(1), Some(accounts.alice));
        }

        #[ink::test]
        fn mint_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.balance_of(accounts.alice, 1), 0);
            assert_eq!(subgame1.mint(accounts.alice, 1, 1000), Ok(()));
            assert_eq!(subgame1.balance_of(accounts.alice, 1), 1000);
        }

        #[ink::test]
        fn mint_batch_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.create([0x02].to_vec()), Ok(()));
            assert_eq!(subgame1.balance_of_batch([accounts.alice, accounts.alice].to_vec(), [1, 2].to_vec()), Ok([0, 0].to_vec()));
            assert_eq!(subgame1.mint_batch(accounts.alice, [1, 2].to_vec(), [1000, 1000].to_vec()), Ok(()));
            assert_eq!(subgame1.balance_of_batch([accounts.alice, accounts.alice].to_vec(), [1, 2].to_vec()), Ok([1000, 1000].to_vec()));
        }

        #[ink::test]
        fn burn_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.mint(accounts.alice, 1, 1000), Ok(()));
            assert_eq!(subgame1.balance_of(accounts.alice, 1), 1000);
            assert_eq!(subgame1.burn(accounts.alice, 1, 200), Ok(()));
            assert_eq!(subgame1.balance_of(accounts.alice, 1), 800);
        }

        #[ink::test]
        fn burn_batch_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.create([0x02].to_vec()), Ok(()));
            assert_eq!(subgame1.mint_batch(accounts.alice, [1, 2].to_vec(), [1000, 1000].to_vec()), Ok(()));
            assert_eq!(subgame1.balance_of_batch([accounts.alice, accounts.alice].to_vec(), [1, 2].to_vec()), Ok([1000, 1000].to_vec()));
            assert_eq!(subgame1.burn_batch(accounts.alice, [1, 2].to_vec(), [200, 200].to_vec()), Ok(()));
            assert_eq!(subgame1.balance_of_batch([accounts.alice, accounts.alice].to_vec(), [1, 2].to_vec()), Ok([800, 800].to_vec()));
        }

        #[ink::test]
        fn safe_transfer_from_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.mint(accounts.alice, 1, 1000), Ok(()));
            assert_eq!(subgame1.balance_of(accounts.alice, 1), 1000);
            assert_eq!(subgame1.balance_of(accounts.bob, 1), 0);
            assert_eq!(subgame1.safe_transfer_from(accounts.alice, accounts.bob, 1, 200), Ok(()));
            assert_eq!(subgame1.balance_of(accounts.alice, 1), 800);
            assert_eq!(subgame1.balance_of(accounts.bob, 1), 200);
        }

        #[ink::test]
        fn safe_batch_transfer_from_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.create([0x02].to_vec()), Ok(()));
            assert_eq!(subgame1.mint_batch(accounts.alice, [1, 2].to_vec(), [1000, 1000].to_vec()), Ok(()));
            assert_eq!(subgame1.balance_of_batch([accounts.alice, accounts.alice].to_vec(), [1, 2].to_vec()), Ok([1000, 1000].to_vec()));
            assert_eq!(subgame1.safe_batch_transfer_from(accounts.alice, accounts.bob, [1, 2].to_vec(), [200, 200].to_vec()), Ok(()));
            assert_eq!(subgame1.balance_of_batch([accounts.alice, accounts.alice, accounts.bob, accounts.bob].to_vec(), [1, 2, 1, 2].to_vec()), Ok([800, 800, 200, 200].to_vec()));
        }

        #[ink::test]
        fn set_approval_for_all_works() {
            let accounts =
                ink_env::test::default_accounts::<ink_env::DefaultEnvironment>()
                    .expect("Cannot get accounts");
            let mut subgame1 = Subgame1::new();
            assert_eq!(subgame1.create([0x01].to_vec()), Ok(()));
            assert_eq!(subgame1.mint(accounts.alice, 1, 1000), Ok(()));
            assert_eq!(subgame1.is_approved_for_all(accounts.alice, accounts.bob), false);
            assert_eq!(subgame1.set_approval_for_all(accounts.bob, true), Ok(()));
            assert_eq!(subgame1.is_approved_for_all(accounts.alice, accounts.bob), true);
        }
    }
}
