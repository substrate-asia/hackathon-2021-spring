#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod skye_pass_vault {
    #[cfg(not(feature = "ink-as-dependency"))]
    use ink_storage::collections::{
        // hashmap::Entry,
        HashMap as StorageHashMap,
    };
    use ink_prelude::string::String;

    use scale::{Decode,Encode};

    pub type VaultId = u128;

    #[ink(storage)]
    #[derive(Default)]
    pub struct SkyePassVault {
        vault_owner: StorageHashMap<VaultId, AccountId>,
        vault_operators: StorageHashMap<(VaultId, AccountId), ()>,
        vault_metadata: StorageHashMap<VaultId, String>,
        next_vaultid: VaultId,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        VaultIdError,
        AccessDenied,
        VaultExists,
    }

    /// Event emitted when a vault is created
    #[ink(event)]
    pub struct VaultCreation {
        #[ink(topic)]
        id: VaultId,
        #[ink(topic)]
        owner: AccountId,
    }

    /// Event emitted when a vault is updated
    #[ink(event)]
    pub struct VaultUpdate {
        #[ink(topic)]
        id: VaultId,
        #[ink(topic)]
        operator: AccountId,
    }

    /// Event emitted when an owner add member to a vault.
    #[ink(event)]
    pub struct MemembershipGranted {
        #[ink(topic)]
        id: VaultId,
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        member: AccountId,
    }

    #[ink(event)]
    pub struct MembershipRevoked {
        #[ink(topic)]
        id: VaultId,
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        member: AccountId,
    }

    #[ink(event)]
    pub struct VaultBurnt {
        #[ink(topic)]
        id: VaultId,
        #[ink(topic)]
        owner: AccountId,
    }

    impl SkyePassVault {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                vault_owner: Default::default(),
                vault_operators: Default::default(),
                vault_metadata: Default::default(),
                next_vaultid: 0,
            }  
        }

        #[ink(message)]
        pub fn owner_of(&self, id: VaultId) -> Option<AccountId> {
            self.vault_owner.get(&id).cloned()
        }

        #[ink(message)]
        pub fn create_vault(&mut self, metadata: String) -> Result<u128, Error> {
            let caller = self.env().caller();

            // get the next vault id
            let new_vault_id = self.next_vaultid;
            self.next_vaultid = self.next_vaultid + 1;

            self.vault_owner.entry(new_vault_id).or_insert(caller);
            self.vault_metadata.entry(new_vault_id).or_insert(metadata);

            self.env().emit_event(VaultCreation {
                id: new_vault_id,
                owner: caller,
            });

            return Ok(new_vault_id);
        }

        #[ink(message)]
        pub fn nominate_member(&mut self, vault_id: VaultId, member: AccountId) -> Result<(), Error> {
            let caller = self.env().caller();

            if !self.authorize_owner(vault_id, caller) {
                return Err(Error::AccessDenied);
            }
            
            self.vault_operators.insert((vault_id, member), ());
            self.env().emit_event(MemembershipGranted {
                id: vault_id,
                owner: caller,
                member: member
            });
            Ok(())
        }

        #[ink(message)]
        pub fn remove_member(&mut self, vault_id: VaultId, member: AccountId) -> Result<(), Error> {
            let caller = self.env().caller();

            if !self.authorize_owner(vault_id, caller) {
                return Err(Error::AccessDenied);
            }

            self.vault_operators.take(&(vault_id, member));
            self.env().emit_event(MembershipRevoked {
                id: vault_id,
                owner: caller,
                member: member
            });
            Ok(())
        }

        #[ink(message)]
        pub fn update_metadata(&mut self, vault_id: VaultId, metadata: String) -> Result<(), Error> {
            let caller = self.env().caller();

            if !self.authorize_owner(vault_id, caller) && 
             !self.authorize_member(vault_id, caller) {
                return Err(Error::AccessDenied);
            }

            let meta = self.vault_metadata.get_mut(&vault_id);
            match meta {
                None => return Err(Error::VaultIdError),
                Some(x) => *x = metadata
            }
            self.env().emit_event(VaultUpdate {
                id: vault_id,
                operator: caller
            });
            Ok(())

        }

        #[ink(message)]
        pub fn burn_vault(&mut self, vault_id: VaultId) -> Result<(), Error> {
            let caller = self.env().caller();
            if !self.authorize_owner(vault_id, caller) {
                return Err(Error::AccessDenied);
            }

            self.vault_owner.take(&vault_id);
            // self.vault_operators.take(&vault_id);
            self.vault_metadata.take(&vault_id);

            self.env().emit_event(VaultBurnt {
                id: vault_id,
                owner: caller,
            });
            Ok(())
        }

        // view functions

        #[ink(message)]
        pub fn get_metadata(&self, vault_id: VaultId) -> Option<String> {
            self.vault_metadata.get(&vault_id).cloned()
        }

        #[ink(message)]
        pub fn authorize_owner(&self, vault_id: VaultId, id: AccountId) -> bool {
            self.vault_owner.get(&vault_id).cloned() == Some(id)
        }

        #[ink(message)]
        pub fn authorize_member(&self, vault_id: VaultId, id: AccountId) -> bool {
            let membership = self.vault_operators.get(&(vault_id, id));
            return membership != None;
        }
    }
}
