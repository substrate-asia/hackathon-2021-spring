#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod polka_name {
    use ink_env::hash::Blake2x256;
    use ink_storage::collections::HashMap;
    // use ink_env::AccountId;
    // use ink_env::{Hash, AccountId};

    // Resolver is the resolved pns value
    // It could be a wallet, contract, IPFS content hash, IPv4, IPv6 etc
    pub type Resolver = AccountId;
    pub type Label = [u8; 32];

    #[ink(storage)]
    #[derive(Default)]
    pub struct PolkaName {
        root: AccountId,                    // contract owner
        records: HashMap<Hash, AccountId>,  // mapping of domain name to owner
        resolvers: HashMap<Hash, Resolver>, // mapping of domain name to resolver
        ttls: HashMap<Hash, u64>,           // mapping of domain name to ttl value
    }

    impl PolkaName {
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                root: Default::default(),
                records: Default::default(),
                resolvers: Default::default(),
                ttls: Default::default(),
            }
        }

        fn authorized(&self, node: &Hash) -> bool {
            let caller = Self::env().caller();
            let node_owner = self.records.get(&node);
            return match node_owner {
                Some(owner) => {
                    if caller == *owner || caller == self.root {
                        true
                    } else {
                        false
                    }
                }
                None => false,
            };
        }

        #[ink(message)]
        pub fn setRecord(
            &mut self,
            node: Hash,
            owner: AccountId,
            resolver: Resolver,
            ttl: u64,
        ) -> bool {
            if !self.authorized(&node) {
                return false;
            }

            self.setOwner(node, owner);
            self._setResolverAndTTL(node, resolver, ttl);

            return true;
        }

        #[ink(message)]
        pub fn setSubnodeRecord(
            &mut self,
            node: Hash,
            label: Label,
            owner: AccountId,
            resolver: Resolver,
            ttl: u64,
        ) -> bool {
            if !self.authorized(&node) {
                return false;
            }

            let subnode: Hash = self.setSubnodeOwner(node, label, owner);
            self._setResolverAndTTL(node, resolver, ttl);

            return true;
        }

        #[ink(message)]
        pub fn setOwner(&mut self, node: Hash, owner: AccountId) -> bool {
            if !self.authorized(&node) {
                return false;
            }

            self.records.insert(node, owner);
            self.env().emit_event(Transfer {
                node: node,
                owner: owner,
            });

            return true;
        }

        #[ink(message)]
        pub fn setSubnodeOwner(&mut self, node: Hash, label: Label, owner: AccountId) -> Hash {
            if !self.authorized(&node) {
                return Hash::default();
            }

            let subnode = self.getSubnode(node, label);
            self.records.insert(subnode, owner);
            self.env().emit_event(NewOwner {
                node: node,
                label: label,
                owner: owner,
            });
            return subnode;
        }

        fn _setResolverAndTTL(&mut self, node: Hash, resolver: Resolver, ttl: u64) {
            match self.resolvers.get(&node) {
                Some(node_resolver) => {}
                _ => {
                    self.resolvers.insert(node, resolver);
                    self.env().emit_event(NewResolver {
                        node: node,
                        resolver: resolver,
                    });
                }
            }

            match self.ttls.get(&node) {
                Some(node_ttl) => {}
                _ => {
                    self.ttls.insert(node, ttl);
                    self.env().emit_event(NewTTL {
                        node: node,
                        ttl: ttl,
                    });
                }
            }
        }

        #[ink(message)]
        pub fn owner(&self, node: Hash) -> Option<AccountId> {
            return self.records.get(&node).cloned();
        }

        #[ink(message)]
        pub fn resolver(&self, node: Hash) -> Option<Resolver> {
            return self.resolvers.get(&node).cloned();
        }

        #[ink(message)]
        pub fn ttl(&self, node: Hash) -> u64 {
            return *self.ttls.get(&node).unwrap_or(&0);
        }

        fn getSubnode(&self, node: Hash, label: Label) -> Hash {
            // todo : fix here
            // concat <label,node> to compute the subnode hash

            // let concated = [node as [u8; 32], label].concat();
            // return Hash(self.env().hash_bytes::<Blake2x256>(&label));
            return node;
        }
    }

    #[ink(event)]
    pub struct NewOwner {
        node: Hash,
        label: [u8; 32],
        owner: AccountId,
    }

    #[ink(event)]
    pub struct NewResolver {
        node: Hash,
        resolver: Resolver,
    }

    #[ink(event)]
    pub struct NewTTL {
        node: Hash,
        ttl: u64,
    }

    #[ink(event)]
    pub struct Transfer {
        node: Hash,
        owner: AccountId,
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn default_works() {
            let polka_name = PolkaName::default();
        }
    }
}
