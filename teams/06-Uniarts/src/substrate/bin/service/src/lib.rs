//! Service and ServiceFactory implementation. Specialized wrapper over substrate service.
// --- uniarts ---
pub mod chain_spec;
pub mod client;
pub use client::*;

// Priority import
pub use sc_service::{
    ChainSpec, Configuration,
};

pub use chain_spec::{PanguChainSpec, FuxiChainSpec};
pub use pangu_runtime;
pub use fuxi_runtime;
use uniarts_primitives::{OpaqueBlock as Block};
use uniarts_rpc::{FullDeps};

use std::sync::Arc;
use std::time::Duration;
use sc_client_api::{ExecutorProvider, RemoteBackend, StateBackendFor};
use sc_service::{error::Error as ServiceError, TaskManager, PartialComponents, config::{KeystoreConfig, PrometheusConfig}};
use sp_inherents::InherentDataProviders;
use sc_executor::native_executor_instance;
pub use sc_executor::{NativeExecutor, NativeExecutionDispatch};
use sp_consensus::{import_queue::BasicQueue};
use sp_consensus_aura::sr25519::{AuthorityPair as AuraPair};
use sc_finality_grandpa::{FinalityProofProvider as GrandpaFinalityProofProvider, SharedVoterState};
use sp_api::ConstructRuntimeApi;
use sp_runtime::traits::BlakeTwo256;
use sp_trie::PrefixedMemoryDB;
use substrate_prometheus_endpoint::Registry;

type FullClient<RuntimeApi, Executor> = sc_service::TFullClient<Block, RuntimeApi, Executor>;
type FullBackend = sc_service::TFullBackend<Block>;
type FullSelectChain = sc_consensus::LongestChain<FullBackend, Block>;
// type FullGrandpaBlockImport<RuntimeApi, Executor> = sc_finality_grandpa::GrandpaBlockImport<
//     FullBackend,
//     Block,
//     FullClient<RuntimeApi, Executor>,
//     FullSelectChain,
// >;
type LightBackend = sc_service::TLightBackendWithHash<Block, BlakeTwo256>;
type LightClient<RuntimeApi, Executor> =
sc_service::TLightClientWithBackend<Block, RuntimeApi, Executor, LightBackend>;


// Our native executor instance.
native_executor_instance!(
	pub PanguExecutor,
	pangu_runtime::api::dispatch,
	pangu_runtime::native_version,
	frame_benchmarking::benchmarking::HostFunctions,
);

native_executor_instance!(
	pub FuxiExecutor,
	fuxi_runtime::api::dispatch,
	fuxi_runtime::native_version,
	frame_benchmarking::benchmarking::HostFunctions,
);

/// Can be called for a `Configuration` to check if it is a configuration for the `pangu` network.
pub trait IdentifyVariant {
    /// Returns if this is a configuration for the `Pangu` network.
    fn is_pangu_network(&self) -> bool;

    /// Returns if this is a configuration for the `Fuxi` network.
    fn is_fuxi_network(&self) -> bool;
}
impl IdentifyVariant for Box<dyn ChainSpec> {
    fn is_pangu_network(&self) -> bool {
        self.id().starts_with("pangu") || self.id().starts_with("uart")
    }

    fn is_fuxi_network(&self) -> bool {
        self.id().starts_with("fuxi")
    }
}

// If we're using prometheus, use a registry with a prefix of `uniarts`.
fn set_prometheus_registry(config: &mut Configuration) -> Result<(), ServiceError> {
    if let Some(PrometheusConfig { registry, .. }) = config.prometheus_config.as_mut() {
        *registry = Registry::new_custom(Some("uniarts".into()), None)?;
    }

    Ok(())
}

pub fn new_partial<RuntimeApi, Executor>(config: &mut Configuration) -> Result<sc_service::PartialComponents<
    FullClient<RuntimeApi, Executor>,
    FullBackend,
    FullSelectChain,
    sp_consensus::DefaultImportQueue<Block, FullClient<RuntimeApi, Executor>>,
    sc_transaction_pool::FullPool<Block, FullClient<RuntimeApi, Executor>>,
    (
        sc_consensus_aura::AuraBlockImport<
            Block,
            FullClient<RuntimeApi, Executor>,
            sc_finality_grandpa::GrandpaBlockImport<FullBackend, Block, FullClient<RuntimeApi, Executor>, FullSelectChain>,
            AuraPair
        >,
        sc_finality_grandpa::LinkHalf<Block, FullClient<RuntimeApi, Executor>, FullSelectChain>
    )
>, ServiceError>
    where
        Executor: 'static + NativeExecutionDispatch,
        RuntimeApi: 'static + Send + Sync + ConstructRuntimeApi<Block, FullClient<RuntimeApi, Executor>>,
        RuntimeApi::RuntimeApi: RuntimeApiCollection<StateBackend = StateBackendFor<FullBackend, Block>>,
{
    set_prometheus_registry(config)?;

    let inherent_data_providers = sp_inherents::InherentDataProviders::new();

    let (client, backend, keystore, task_manager) =
        sc_service::new_full_parts::<Block, RuntimeApi, Executor>(&config)?;
    let client = Arc::new(client);

    let select_chain = sc_consensus::LongestChain::new(backend.clone());

    let transaction_pool = sc_transaction_pool::BasicPool::new_full(
        config.transaction_pool.clone(),
        config.prometheus_registry(),
        task_manager.spawn_handle(),
        client.clone(),
    );

    let (grandpa_block_import, grandpa_link) = sc_finality_grandpa::block_import(
        client.clone(), &(client.clone() as Arc<_>), select_chain.clone(),
    )?;

    let aura_block_import = sc_consensus_aura::AuraBlockImport::<_, _, _, AuraPair>::new(
        grandpa_block_import.clone(), client.clone(),
    );

    let import_queue = sc_consensus_aura::import_queue::<_, _, _, AuraPair, _, _>(
        sc_consensus_aura::slot_duration(&*client)?,
        aura_block_import.clone(),
        Some(Box::new(grandpa_block_import.clone())),
        None,
        client.clone(),
        inherent_data_providers.clone(),
        &task_manager.spawn_handle(),
        config.prometheus_registry(),
        sp_consensus::CanAuthorWithNativeVersion::new(client.executor().clone()),
    )?;

    Ok(sc_service::PartialComponents {
        client, backend, task_manager, import_queue, keystore, select_chain, transaction_pool,
        inherent_data_providers,
        other: (aura_block_import, grandpa_link),
    })
}

/// Builds a new service for a full client.
pub fn new_full<RuntimeApi, Executor>(mut config: Configuration) -> Result<(TaskManager, Arc<FullClient<RuntimeApi, Executor>>), ServiceError>
    where
        Executor: 'static + NativeExecutionDispatch,
        RuntimeApi: 'static + Send + Sync + ConstructRuntimeApi<Block, FullClient<RuntimeApi, Executor>>,
        RuntimeApi::RuntimeApi: RuntimeApiCollection<StateBackend = StateBackendFor<FullBackend, Block>>,
{
    let sc_service::PartialComponents {
        client, backend, mut task_manager, import_queue, keystore, select_chain, transaction_pool,
        inherent_data_providers,
        other: (block_import, grandpa_link),
    } = new_partial(&mut config)?;

    let finality_proof_provider =
        GrandpaFinalityProofProvider::new_for_service(backend.clone(), client.clone());

    let (network, network_status_sinks, system_rpc_tx, network_starter) =
        sc_service::build_network(sc_service::BuildNetworkParams {
            config: &config,
            client: client.clone(),
            transaction_pool: transaction_pool.clone(),
            spawn_handle: task_manager.spawn_handle(),
            import_queue,
            on_demand: None,
            block_announce_validator_builder: None,
            finality_proof_request_builder: None,
            finality_proof_provider: Some(finality_proof_provider.clone()),
        })?;

    if config.offchain_worker.enabled {
        sc_service::build_offchain_workers(
            &config, backend.clone(), task_manager.spawn_handle(), client.clone(), network.clone(),
        );
    }

    let role = config.role.clone();
    let force_authoring = config.force_authoring;
    let name = config.network.node_name.clone();
    let enable_grandpa = !config.disable_grandpa;
    let prometheus_registry = config.prometheus_registry().cloned();
    let telemetry_connection_sinks = sc_service::TelemetryConnectionSinks::default();

    let rpc_extensions_builder = {
        let client = client.clone();
        let pool = transaction_pool.clone();

        Box::new(move |deny_unsafe, _| {
            let deps = FullDeps {
                client: client.clone(),
                pool: pool.clone(),
                deny_unsafe,
            };

            uniarts_rpc::create_full(deps)
        })
    };

    sc_service::spawn_tasks(sc_service::SpawnTasksParams {
        network: network.clone(),
        client: client.clone(),
        keystore: keystore.clone(),
        task_manager: &mut task_manager,
        transaction_pool: transaction_pool.clone(),
        telemetry_connection_sinks: telemetry_connection_sinks.clone(),
        rpc_extensions_builder: rpc_extensions_builder,
        on_demand: None,
        remote_blockchain: None,
        backend, network_status_sinks, system_rpc_tx, config,
    })?;

    if role.is_authority() {
        let proposer = sc_basic_authorship::ProposerFactory::new(
            client.clone(),
            transaction_pool,
            prometheus_registry.as_ref(),
        );

        let can_author_with =
            sp_consensus::CanAuthorWithNativeVersion::new(client.executor().clone());

        let aura = sc_consensus_aura::start_aura::<_, _, _, _, _, AuraPair, _, _, _>(
            sc_consensus_aura::slot_duration(&*client)?,
            client.clone(),
            select_chain,
            block_import,
            proposer,
            network.clone(),
            inherent_data_providers.clone(),
            force_authoring,
            keystore.clone(),
            can_author_with,
        )?;

        // the AURA authoring task is considered essential, i.e. if it
        // fails we take down the service with it.
        task_manager.spawn_essential_handle().spawn_blocking("aura", aura);
    }

    // if the node isn't actively participating in consensus then it doesn't
    // need a keystore, regardless of which protocol we use below.
    let keystore = if role.is_authority() {
        Some(keystore as sp_core::traits::BareCryptoStorePtr)
    } else {
        None
    };

    let grandpa_config = sc_finality_grandpa::Config {
        // FIXME #1578 make this available through chainspec
        gossip_duration: Duration::from_millis(333),
        justification_period: 512,
        name: Some(name),
        observer_enabled: false,
        keystore,
        is_authority: role.is_network_authority(),
    };

    if enable_grandpa {
        // start the full GRANDPA voter
        // NOTE: non-authorities could run the GRANDPA observer protocol, but at
        // this point the full voter should provide better guarantees of block
        // and vote data availability than the observer. The observer has not
        // been tested extensively yet and having most nodes in a network run it
        // could lead to finality stalls.
        let grandpa_config = sc_finality_grandpa::GrandpaParams {
            config: grandpa_config,
            link: grandpa_link,
            network,
            inherent_data_providers,
            telemetry_on_connect: Some(telemetry_connection_sinks.on_connect_stream()),
            voting_rule: sc_finality_grandpa::VotingRulesBuilder::default().build(),
            prometheus_registry,
            shared_voter_state: SharedVoterState::empty(),
        };

        // the GRANDPA voter task is considered infallible, i.e.
        // if it fails we take down the service with it.
        task_manager.spawn_essential_handle().spawn_blocking(
            "grandpa-voter",
            sc_finality_grandpa::run_grandpa_voter(grandpa_config)?
        );
    } else {
        sc_finality_grandpa::setup_disabled_grandpa(
            client.clone(),
            &inherent_data_providers,
            network,
        )?;
    }

    network_starter.start_network();
    Ok((task_manager, client))
}

/// Builds a new service for a light client.
pub fn new_light<RuntimeApi, Executor>(mut config: Configuration) -> Result<TaskManager, ServiceError>
    where
        Executor: 'static + NativeExecutionDispatch,
        RuntimeApi:
        'static + Send + Sync + ConstructRuntimeApi<Block, LightClient<RuntimeApi, Executor>>,
        <RuntimeApi as ConstructRuntimeApi<Block, LightClient<RuntimeApi, Executor>>>::RuntimeApi:
        RuntimeApiCollection<StateBackend = StateBackendFor<LightBackend, Block>>,
{
    set_prometheus_registry(&mut config)?;

    let (client, backend, keystore, mut task_manager, on_demand) =
        sc_service::new_light_parts::<Block, RuntimeApi, Executor>(&config)?;

    let transaction_pool = Arc::new(sc_transaction_pool::BasicPool::new_light(
        config.transaction_pool.clone(),
        config.prometheus_registry(),
        task_manager.spawn_handle(),
        client.clone(),
        on_demand.clone(),
    ));

    let grandpa_block_import = sc_finality_grandpa::light_block_import(
        client.clone(), backend.clone(), &(client.clone() as Arc<_>),
        Arc::new(on_demand.checker().clone()) as Arc<_>,
    )?;
    let finality_proof_import = grandpa_block_import.clone();
    let finality_proof_request_builder =
        finality_proof_import.create_finality_proof_request_builder();

    let import_queue = sc_consensus_aura::import_queue::<_, _, _, AuraPair, _, _>(
        sc_consensus_aura::slot_duration(&*client)?,
        grandpa_block_import,
        None,
        Some(Box::new(finality_proof_import)),
        client.clone(),
        InherentDataProviders::new(),
        &task_manager.spawn_handle(),
        config.prometheus_registry(),
        sp_consensus::NeverCanAuthor,
    )?;

    let finality_proof_provider =
        GrandpaFinalityProofProvider::new_for_service(backend.clone(), client.clone());

    let (network, network_status_sinks, system_rpc_tx, network_starter) =
        sc_service::build_network(sc_service::BuildNetworkParams {
            config: &config,
            client: client.clone(),
            transaction_pool: transaction_pool.clone(),
            spawn_handle: task_manager.spawn_handle(),
            import_queue,
            on_demand: Some(on_demand.clone()),
            block_announce_validator_builder: None,
            finality_proof_request_builder: Some(finality_proof_request_builder),
            finality_proof_provider: Some(finality_proof_provider),
        })?;

    if config.offchain_worker.enabled {
        sc_service::build_offchain_workers(
            &config, backend.clone(), task_manager.spawn_handle(), client.clone(), network.clone(),
        );
    }

    sc_service::spawn_tasks(sc_service::SpawnTasksParams {
        remote_blockchain: Some(backend.remote_blockchain()),
        transaction_pool,
        task_manager: &mut task_manager,
        on_demand: Some(on_demand),
        rpc_extensions_builder: Box::new(|_, _| ()),
        telemetry_connection_sinks: sc_service::TelemetryConnectionSinks::default(),
        config,
        client,
        keystore,
        backend,
        network,
        network_status_sinks,
        system_rpc_tx,
    })?;

    network_starter.start_network();

    Ok(task_manager)
}

/// Builds a new object suitable for chain operations.
#[cfg(feature = "full-node")]
pub fn new_chain_ops<Runtime, Dispatch>(
    config: &mut Configuration,
) -> Result<
    (
        Arc<FullClient<Runtime, Dispatch>>,
        Arc<FullBackend>,
        BasicQueue<Block, PrefixedMemoryDB<BlakeTwo256>>,
        TaskManager,
    ),
    ServiceError,
>
    where
        Dispatch: 'static + NativeExecutionDispatch,
        Runtime: 'static + Send + Sync + ConstructRuntimeApi<Block, FullClient<Runtime, Dispatch>>,
        Runtime::RuntimeApi: RuntimeApiCollection<StateBackend = StateBackendFor<FullBackend, Block>>,
{
    config.keystore = KeystoreConfig::InMemory;

    let PartialComponents {
        client,
        backend,
        import_queue,
        task_manager,
        ..
    } = new_partial::<Runtime, Dispatch>(config)?;

    Ok((client, backend, import_queue, task_manager))
}

/// Create a new Uniarts service for a full node.
#[cfg(feature = "full-node")]
pub fn pangu_new_full(
    config: Configuration,
) -> Result<
    (
        TaskManager,
        Arc<impl UniartsClient<Block, FullBackend, pangu_runtime::RuntimeApi>>,
    ),
    ServiceError,
> {
    let (components, client) = new_full::<pangu_runtime::RuntimeApi, PanguExecutor>(config)?;

    Ok((components, client))
}

/// Create a new Uniarts service for a light client.
pub fn pangu_new_light(config: Configuration) -> Result<TaskManager, ServiceError> {
    new_light::<pangu_runtime::RuntimeApi, PanguExecutor>(config)
}

/// Create a new Uniarts service for a full node.
#[cfg(feature = "full-node")]
pub fn fuxi_new_full(
    config: Configuration,
) -> Result<
    (
        TaskManager,
        Arc<impl UniartsClient<Block, FullBackend, fuxi_runtime::RuntimeApi>>,
    ),
    ServiceError,
> {
    let (components, client) = new_full::<fuxi_runtime::RuntimeApi, FuxiExecutor>(config)?;

    Ok((components, client))
}

/// Create a new Uniarts service for a light client.
pub fn fuxi_new_light(config: Configuration) -> Result<TaskManager, ServiceError> {
    new_light::<fuxi_runtime::RuntimeApi, FuxiExecutor>(config)
}
