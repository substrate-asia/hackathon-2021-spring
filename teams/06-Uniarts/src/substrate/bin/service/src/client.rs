//! Uniarts Client meta trait

/// Uniarts client abstraction, this super trait only pulls in functionality required for
/// Uniarts internal crates.
// --- crates ---
pub use codec::Codec;
use uniarts_primitives::{OpaqueBlock as Block, AccountId, Balance, Nonce, BlockNumber, AuraId};
use sp_runtime::traits::BlakeTwo256;

pub trait UniartsClient<Block, Backend, Runtime>: Sized
    + Send
    + Sync
    + sc_client_api::BlockchainEvents<Block>
    + sp_api::CallApiAt<Block, Error = sp_blockchain::Error, StateBackend = Backend::State>
    + sp_api::ProvideRuntimeApi<Block, Api = Runtime::RuntimeApi>
    + sp_blockchain::HeaderBackend<Block>
    where
        Backend: sc_client_api::Backend<Block>,
        Block: sp_runtime::traits::Block,
        Runtime: sp_api::ConstructRuntimeApi<Block, Self>,
{
}

impl<Block, Backend, Runtime, Client> UniartsClient<Block, Backend, Runtime> for Client
    where
        Backend: sc_client_api::Backend<Block>,
        Block: sp_runtime::traits::Block,
        Client: Sized
        + Send
        + Sync
        + sp_api::CallApiAt<Block, Error = sp_blockchain::Error, StateBackend = Backend::State>
        + sp_api::ProvideRuntimeApi<Block, Api = Runtime::RuntimeApi>
        + sp_blockchain::HeaderBackend<Block>
        + sc_client_api::BlockchainEvents<Block>,
        Runtime: sp_api::ConstructRuntimeApi<Block, Self>,
{
}

/// A set of APIs that Uniarts-like runtimes must implement.
pub trait RuntimeApiCollection:
    sp_api::ApiExt<Block, Error = sp_blockchain::Error>
    + sp_api::Metadata<Block>
    + sp_block_builder::BlockBuilder<Block>
    + sp_consensus_aura::AuraApi<Block, AuraId>
    + sp_finality_grandpa::GrandpaApi<Block>
    + sp_offchain::OffchainWorkerApi<Block>
    + sp_session::SessionKeys<Block>
    + sp_transaction_pool::runtime_api::TaggedTransactionQueue<Block>
    + frame_system_rpc_runtime_api::AccountNonceApi<Block, AccountId, Nonce>
    + pallet_transaction_payment_rpc_runtime_api::TransactionPaymentApi<Block, Balance>
    + pallet_staking_rpc::StakingRuntimeApi<Block, AccountId, Balance>
    + pallet_contracts_rpc::ContractsRuntimeApi<Block, AccountId, Balance, BlockNumber>
    where
        <Self as sp_api::ApiExt<Block>>::StateBackend: sp_api::StateBackend<BlakeTwo256>,
{
}

impl<Api> RuntimeApiCollection for Api
    where
        Api: sp_transaction_pool::runtime_api::TaggedTransactionQueue<Block>
        + sp_api::ApiExt<Block, Error = sp_blockchain::Error>
        + sp_api::Metadata<Block>
        + sp_block_builder::BlockBuilder<Block>
        + sp_consensus_aura::AuraApi<Block, AuraId>
        + sp_finality_grandpa::GrandpaApi<Block>
        + sp_offchain::OffchainWorkerApi<Block>
        + sp_session::SessionKeys<Block>
        + frame_system_rpc_runtime_api::AccountNonceApi<Block, AccountId, Nonce>
        + pallet_transaction_payment_rpc_runtime_api::TransactionPaymentApi<Block, Balance>
        + pallet_staking_rpc::StakingRuntimeApi<Block, AccountId, Balance>
        + pallet_contracts_rpc::ContractsRuntimeApi<Block, AccountId, Balance, BlockNumber>,
        <Self as sp_api::ApiExt<Block>>::StateBackend: sp_api::StateBackend<BlakeTwo256>,
{
}

pub trait RuntimeExtrinsic: codec::Codec + Send + Sync + 'static {}
impl<E> RuntimeExtrinsic for E where E: codec::Codec + Send + Sync + 'static {}