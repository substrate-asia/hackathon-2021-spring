/*
 * Copyright (C) 2017-2021 blocktree.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//! RPC interface for the generic asset module.

use std::sync::Arc;
use codec::{Encode, Decode};
use jsonrpc_core::{Error as RpcError, ErrorCode, Result};
use jsonrpc_derive::rpc;
use sp_api::ProvideRuntimeApi;
use sp_blockchain::HeaderBackend;
use sp_runtime::{generic::BlockId, traits::{Block as BlockT}};
use pallet_generic_asset::AssetInfo;
pub use pallet_generic_asset_rpc_runtime_api::AssetMetaApi;
pub use self::gen_client::Client as GenericAssetClient;

#[rpc]
pub trait GenericAssetApi<BlockHash, ResponseType>
{
	/// Get all assets data paired with their ids.
	#[rpc(name = "genericAsset_registeredAssets")]
	fn asset_meta(&self, at: Option<BlockHash>) -> Result<ResponseType>;

}

/// A struct that implements the [`GenericAssetApi`].
pub struct GenericAsset<C, P> {
	client: Arc<C>,
	_marker: std::marker::PhantomData<P>,
}

impl<C, P> GenericAsset<C, P> {
	/// Create new `GenericAsset` with the given reference to the client.
	pub fn new(client: Arc<C>) -> Self {
		GenericAsset { client, _marker: Default::default() }
	}
}

/// Error type of this RPC api.
pub enum Error {
	/// The call to runtime failed.
	RuntimeError,
}

impl<C, Block, AssetId> GenericAssetApi<<Block as BlockT>::Hash, Vec<(AssetId, AssetInfo)>>
	for GenericAsset<C, (Block, AssetId)>
where
	Block: BlockT,
	C: Send + Sync + 'static + ProvideRuntimeApi<Block> + HeaderBackend<Block>,
	C::Api: AssetMetaApi<Block, AssetId>,
	AssetId: Decode + Encode + Send + Sync + 'static,
{
	fn asset_meta(
		&self,
		at: Option<<Block as BlockT>::Hash>
	) -> Result<Vec<(AssetId, AssetInfo)>> {
		let at = BlockId::hash(at.unwrap_or_else(||
			// If the block hash is not supplied assume the best block.
			self.client.info().best_hash
		));

		self.client.runtime_api().asset_meta(&at).map_err(|e| RpcError {
			code: ErrorCode::ServerError(Error::RuntimeError as i64),
			message: "Unable to query asset meta data.".into(),
			data: Some(format!("{:?}", e).into()),
		})
	}
}
