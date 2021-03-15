// Copyright 2018-2020 Parity Technologies (UK) Ltd.
// This file is part of cargo-contract.
//
// cargo-contract is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// cargo-contract is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with cargo-contract.  If not, see <http://www.gnu.org/licenses/>.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::path::PathBuf;

use crate::error::Error;
use codec::{Decode, Encode};
use ink_metadata::InkProject;
use sp_core::Bytes;
use sp_rpc::number;

pub fn load_metadata(path: PathBuf) -> Result<ink_metadata::InkProject> {
    let metadata = serde_json::from_reader(File::open(path)?)?;
    Ok(metadata)
}

pub struct ContractMessage {
    metadata: InkProject,
}

impl ContractMessage {
    pub fn new(contract_metadata: PathBuf) -> Self {
        let metadata = load_metadata(contract_metadata).unwrap();
        Self { metadata }
    }

    pub fn find_message_selector(&self, name: &str) -> Option<Vec<u8>> {
        let spec = self
            .metadata
            .spec()
            .messages()
            .iter()
            .find(|msg| msg.name().contains(&name.to_string()));

        if let Some(selector) = spec {
            Some(selector.selector().to_bytes().to_vec())
        } else {
            None
        }
    }

    pub fn call_data_encode(&self, name: &str, args_encoded: Vec<u8>) -> Result<Vec<u8>, Error> {
        let mut selector = self
            .find_message_selector(name)
            .ok_or(Error::Other(format!(
                "contract function not found: {}",
                name
            )))?;
        selector.extend_from_slice(args_encoded.as_slice());
        Ok(selector)
    }
}

/// A struct that encodes RPC parameters required for a call to a smart-contract.
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(deny_unknown_fields)]
pub struct CallRequest<AccountId> {
    pub(crate) origin: AccountId,
    pub(crate) dest: AccountId,
    pub(crate) value: number::NumberOrHex,
    pub(crate) gas_limit: number::NumberOrHex,
    pub(crate) input_data: Bytes,
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
pub struct RpcContractExecSuccess {
    /// The return flags. See `pallet_contracts_primitives::ReturnFlags`.
    pub(crate) flags: u32,
    /// Data as returned by the contract.
    pub(crate) data: Bytes,
}

/// An RPC serializable result of contract execution
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "camelCase")]
pub struct RpcContractExecResult {
    /// How much gas was consumed by the call. In case of an error this is the amount
    /// that was used up until the error occurred.
    pub(crate) gas_consumed: u64,
    /// Additional dynamic human readable error information for debugging. An empty string
    /// indicates that no additional information is available.
    pub(crate) debug_message: String,
    /// Indicates whether the contract execution was successful or not.
    pub(crate) result: std::result::Result<RpcContractExecSuccess, DispatchError>,
}

/// Reason why a dispatch call failed.
#[derive(Debug, Eq, PartialEq, Clone, Copy, Encode, Decode)]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
pub enum DispatchError {
    /// Some error occurred.
    Other(
        #[codec(skip)]
        #[cfg_attr(feature = "std", serde(skip_deserializing))]
        &'static str,
    ),
    /// Failed to lookup some data.
    CannotLookup,
    /// A bad origin.
    BadOrigin,
    /// A custom error in a module.
    Module {
        /// Module index, matching the metadata module index.
        index: u8,
        /// Module specific error value.
        error: u8,
        /// Optional error message.
        #[codec(skip)]
        #[cfg_attr(feature = "std", serde(skip_deserializing))]
        message: Option<&'static str>,
    },
    /// At least one consumer is remaining so the account cannot be destroyed.
    ConsumerRemaining,
    /// There are no providers so the account cannot be created.
    NoProviders,
}

impl From<DispatchError> for &'static str {
    fn from(err: DispatchError) -> &'static str {
        match err {
            DispatchError::Other(msg) => msg,
            DispatchError::CannotLookup => "Cannot lookup",
            DispatchError::BadOrigin => "Bad origin",
            DispatchError::Module { message, .. } => message.unwrap_or("Unknown module error"),
            DispatchError::ConsumerRemaining => "Consumer remaining",
            DispatchError::NoProviders => "No providers",
        }
    }
}
