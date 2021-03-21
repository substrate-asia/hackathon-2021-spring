use std;
use serde_yaml;
use sp_core::{Pair, Public, sr25519};
use highway_runtime::{
	AccountId, AuraConfig, BalancesConfig, GenesisConfig, GrandpaConfig,
	SudoConfig, SystemConfig, WASM_BINARY, Signature, ContractsConfig
};
use sp_consensus_aura::sr25519::AuthorityId as AuraId;
use sp_finality_grandpa::AuthorityId as GrandpaId;
use sp_runtime::traits::{Verify, IdentifyAccount};
use sc_service::ChainType;
use sp_core::OpaquePeerId;
use highway_runtime::NodeAuthorizationConfig;
use crate::{network_config};

/// Specialized `ChainSpec`. This is a specialization of the general Substrate ChainSpec type.
pub type ChainSpec = sc_service::GenericChainSpec<GenesisConfig>;

pub type AccountPublic = <Signature as Verify>::Signer;

pub fn get_public_from_seed<TPublic: Public>(seed: &str) -> <TPublic::Pair as Pair>::Public {
	TPublic::Pair::from_string(&format!("0x{}", seed), None)
		.expect("static values are valid; qed")
		.public()
}

pub fn get_account_id_from_seed<TPublic: Public>(seed: &str) -> AccountId where
	AccountPublic: From<<TPublic::Pair as Pair>::Public>
{
	AccountPublic::from(get_public_from_seed::<TPublic>(seed)).into_account()
}

pub fn authority_keys_from_seed(s: &str) -> (AuraId, GrandpaId) {
	(
		get_public_from_seed::<AuraId>(s),
		get_public_from_seed::<GrandpaId>(s),
	)
}

pub fn load_config(network_config_path: &str) -> Result<ChainSpec, String> {
	let contents = std::fs::read_to_string(
		std::path::PathBuf::from(network_config_path).as_path()
	).unwrap();
	let network_config: network_config::Network = serde_yaml::from_str(&contents).unwrap();
	let wasm_binary = WASM_BINARY.ok_or(network_config.name.clone() + " wasm binary not available")?;

	let mut root_key: Option<AccountId> = None;
	let mut initial_authorities: Vec<(AuraId, GrandpaId)> = vec![];
	let mut endowed_accounts: Vec<AccountId> = vec![];
	let mut authorization_nodes: Vec<(OpaquePeerId, AccountId)> = vec![];
	for peer in &network_config.peers {
		if peer.is_root {
			root_key = Option::from(get_account_id_from_seed::<sr25519::Public>(&peer.secret.seed));
		}
		if peer.is_group_main {
			initial_authorities.push(authority_keys_from_seed(&peer.secret.seed));
			authorization_nodes.push((
				OpaquePeerId(bs58::decode(&peer.peer_id).into_vec().unwrap()),
				get_account_id_from_seed::<sr25519::Public>(&peer.secret.seed),
			));
		}
		endowed_accounts.push(get_account_id_from_seed::<sr25519::Public>(&peer.secret.seed));
	}
	let root_key = root_key.expect("Can't find root key");
	Ok(ChainSpec::from_genesis(
		network_config.name.clone().as_str(),
		network_config.id.clone().as_str(),
		ChainType::Live,
		move || net_genesis(
			wasm_binary,
			// Initial PoA authorities
			initial_authorities.clone(),
			// Sudo account
			root_key.clone(),
			// Pre-funded accounts
			endowed_accounts.clone(),
			// Authorization nodes
			authorization_nodes.clone(),
			true,
		),
		// Bootnodes
		vec![],
		// Telemetry
		None,
		// Protocol ID
		None,
		// Properties
		None,
		// Extensions
		None,
	))
}

fn net_genesis(
	wasm_binary: &[u8],
	initial_authorities: Vec<(AuraId, GrandpaId)>,
	root_key: AccountId,
	endowed_accounts: Vec<AccountId>,
	authorization_nodes: Vec<(OpaquePeerId, AccountId)>,
	enable_println: bool,
) -> GenesisConfig {
	GenesisConfig {
		frame_system: Some(SystemConfig {
			// Add Wasm runtime to storage.
			code: wasm_binary.to_vec(),
			changes_trie_config: Default::default(),
		}),
		pallet_balances: Some(BalancesConfig {
			// Configure endowed accounts with initial balance of 1 << 60.
			balances: endowed_accounts.iter().cloned().map(|k|(k, 1 << 60)).collect(),
		}),
		pallet_aura: Some(AuraConfig {
			authorities: initial_authorities.iter().map(|x| (x.0.clone())).collect(),
		}),
		pallet_grandpa: Some(GrandpaConfig {
			authorities: initial_authorities.iter().map(|x| (x.1.clone(), 1)).collect(),
		}),
		pallet_sudo: Some(SudoConfig {
			// Assign network admin rights.
			key: root_key,
		}),
		pallet_contracts: Some(ContractsConfig {
			current_schedule: pallet_contracts::Schedule {
				enable_println,
				..Default::default()
			},
		}),
		pallet_node_authorization: Some(NodeAuthorizationConfig {
			nodes: authorization_nodes
		}),
	}
}