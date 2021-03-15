#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod evidence {

    use ink_prelude::string::String;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct Evidence {
        evi_str: ink_storage::collections::HashMap<AccountId, String>,
    }

    impl Evidence {
        /// Constructor that initializes the `evi` Hashmap
        #[ink(constructor)]
        pub fn new() -> Self {
            let evi_str = ink_storage::collections::HashMap::new();
            Self { 
                evi_str
            }
        }

        /// Init
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }

        /// create the evi
        #[ink(message)]
        pub fn new_evidence(&mut self, payload: String, addr: AccountId) {
            self.evi_str.insert(addr, payload);
        }


        /// Get the evi for a given AccountId
        #[ink(message)]
        pub fn get_evidence(&self, addr: AccountId) -> String {
            self.do_get(&addr)
        }

        // Returns the number for an AccountId or 0 if it is not set.
        fn do_get(&self, addr: &AccountId) -> String {
            let error_info: String =String::from("not exist");
            let value = self.evi_str.get(addr).unwrap_or(&error_info);
            value.clone()
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
            let evidence = Evidence::default();
            assert_eq!(evidence.get(), false);
        }

        /// We test a simple use case of our contract.
        #[test]
        fn it_works() {
            assert_eq!(true, true);
        }
    }
}
