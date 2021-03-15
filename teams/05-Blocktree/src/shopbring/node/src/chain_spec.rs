use self::shopbring::{
    constants::{asset::*, currency::*},
    AccountId, AssetInfo, Signature, WASM_BINARY,
};
use hex_literal::hex;
use jsonrpc_core::serde_json;
use primitives::AssetId;
use sc_service::{ChainType, Properties};
use shopbring_runtime as shopbring;
use sp_consensus_aura::sr25519::AuthorityId as AuraId;
use sp_core::crypto::Ss58Codec;
use sp_core::crypto::UncheckedInto;
use sp_core::{sr25519, Pair, Public};
use sp_finality_grandpa::AuthorityId as GrandpaId;
use sp_runtime::traits::{IdentifyAccount, Verify};
use telemetry::TelemetryEndpoints;

// The URL for the telemetry server.
const STAGING_TELEMETRY_URL: &str = "wss://telemetry.polkadot.io/submit/";
const DEFAULT_PROTOCOL_ID: &str = "sbg";

/// Specialized `ChainSpec`. This is a specialization of the general Substrate ChainSpec type.
pub type ChainSpec = sc_service::GenericChainSpec<shopbring::GenesisConfig>;

/// Generate a crypto pair from seed.
pub fn get_from_seed<TPublic: Public>(seed: &str) -> <TPublic::Pair as Pair>::Public {
    TPublic::Pair::from_string(&format!("//{}", seed), None)
        .expect("static values are valid; qed")
        .public()
}

type AccountPublic = <Signature as Verify>::Signer;

/// Generate an account ID from seed.
pub fn get_account_id_from_seed<TPublic: Public>(seed: &str) -> AccountId
where
    AccountPublic: From<<TPublic::Pair as Pair>::Public>,
{
    AccountPublic::from(get_from_seed::<TPublic>(seed)).into_account()
}

/// Generate an account ID from ss58 address.
pub fn get_account_id_from_ss58(address: &str) -> AccountId {
    AccountId::from_ss58check(address)
        .unwrap_or(get_account_id_from_seed::<sr25519::Public>("Alice"))
}

/// Generate an Aura authority key.
pub fn authority_keys_from_seed(s: &str) -> (AuraId, GrandpaId) {
    (get_from_seed::<AuraId>(s), get_from_seed::<GrandpaId>(s))
}

pub fn development_config() -> Result<ChainSpec, String> {
    let wasm_binary = WASM_BINARY.ok_or("Development wasm binary not available".to_string())?;

    Ok(ChainSpec::from_genesis(
        // Name
        "Development",
        // ID
        "dev",
        ChainType::Development,
        move || {
            testnet_genesis(
                wasm_binary,
                // Initial PoA authorities
                vec![authority_keys_from_seed("Alice")],
                // Sudo account
                get_account_id_from_seed::<sr25519::Public>("Alice"),
                // Pre-funded accounts
                vec![
                    get_account_id_from_seed::<sr25519::Public>("Alice"),
                    get_account_id_from_seed::<sr25519::Public>("Bob"),
                    get_account_id_from_seed::<sr25519::Public>("Alice//stash"),
                    get_account_id_from_seed::<sr25519::Public>("Bob//stash"),
                ],
                vec![(SBG_ASSET_ID, AssetInfo::new(b"SBG".to_vec(), 8))],
                true,
            )
        },
        // Bootnodes
        vec![],
        // Telemetry
        None,
        // Protocol ID
        None,
        // Properties
        shopbring_testnet_properties(),
        // Extensions
        None,
    ))
}

pub fn local_testnet_config() -> Result<ChainSpec, String> {
    let wasm_binary = WASM_BINARY.ok_or("Development wasm binary not available".to_string())?;

    Ok(ChainSpec::from_genesis(
        // Name
        "Local Testnet",
        // ID
        "local_testnet",
        ChainType::Local,
        move || {
            testnet_genesis(
                wasm_binary,
                // Initial PoA authorities
                vec![
                    authority_keys_from_seed("Alice"),
                    authority_keys_from_seed("Bob"),
                ],
                // Sudo account
                get_account_id_from_seed::<sr25519::Public>("Alice"),
                // Pre-funded accounts
                vec![
                    get_account_id_from_seed::<sr25519::Public>("Alice"),
                    get_account_id_from_seed::<sr25519::Public>("Bob"),
                    get_account_id_from_seed::<sr25519::Public>("Charlie"),
                    get_account_id_from_seed::<sr25519::Public>("Dave"),
                    get_account_id_from_seed::<sr25519::Public>("Alice//stash"),
                    get_account_id_from_seed::<sr25519::Public>("Bob//stash"),
                    get_account_id_from_seed::<sr25519::Public>("Charlie//stash"),
                    get_account_id_from_seed::<sr25519::Public>("Dave//stash"),
                ],
                vec![(SBG_ASSET_ID, AssetInfo::new(b"SBG".to_vec(), 8))],
                true,
            )
        },
        // Bootnodes
        vec![],
        // Telemetry
        None,
        // Protocol ID
        None,
        // Properties
        shopbring_testnet_properties(),
        // Extensions
        None,
    ))
}

/// Configure initial storage state for FRAME modules.
fn testnet_genesis(
    wasm_binary: &[u8],
    initial_authorities: Vec<(AuraId, GrandpaId)>,
    root_key: AccountId,
    endowed_accounts: Vec<AccountId>,
    initial_assets: Vec<(AssetId, AssetInfo)>,
    _enable_println: bool,
) -> shopbring::GenesisConfig {
    shopbring::GenesisConfig {
        frame_system: Some(shopbring::SystemConfig {
            // Add Wasm runtime to storage.
            code: wasm_binary.to_vec(),
            changes_trie_config: Default::default(),
        }),
        // pallet_balances: Some(shopbring::BalancesConfig {
        //     // Configure endowed accounts with initial balance of 1 << 60.
        //     balances: endowed_accounts
        //         .iter()
        //         .cloned()
        //         .map(|k| (k, 1 << 60))
        //         .collect(),
        // }),
        pallet_aura: Some(shopbring::AuraConfig {
            authorities: initial_authorities.iter().map(|x| (x.0.clone())).collect(),
        }),
        pallet_grandpa: Some(shopbring::GrandpaConfig {
            authorities: initial_authorities
                .iter()
                .map(|x| (x.1.clone(), 1))
                .collect(),
        }),
        pallet_sudo: Some(shopbring::SudoConfig {
            // Assign network admin rights.
            key: root_key.clone(),
        }),
        pallet_generic_asset: Some(shopbring::GenericAssetConfig {
            assets: initial_assets.iter().map(|x| x.0.clone()).collect(),
            // Grant root key full permissions (mint,burn,update) on the following assets
            permissions: initial_assets
                .iter()
                .map(|x| (x.0.clone(), root_key.clone()))
                .collect(),
            initial_balance: 10u128.pow(8 + 9), // 1 billion token with 8 decimals
            endowed_accounts: endowed_accounts,
            next_asset_id: NEXT_ASSET_ID,
            staking_asset_id: STAKING_ASSET_ID,
            spending_asset_id: SPENDING_ASSET_ID,
            asset_meta: initial_assets
                .iter()
                .map(|x| (x.0.clone(), x.1.clone()))
                .collect(),
        }),
    }
}

pub fn shopbring_staging_testnet_config() -> Result<ChainSpec, String> {
    let wasm_binary = WASM_BINARY.ok_or("Shopbring development wasm not available")?;
    let boot_nodes = vec![];

    Ok(ChainSpec::from_genesis(
        "Shopbring Staging Testnet",
        "shopbring_staging_testnet",
        ChainType::Live,
        move || shopbring_staging_config_genesis(wasm_binary),
        boot_nodes,
        Some(
            TelemetryEndpoints::new(vec![(STAGING_TELEMETRY_URL.to_string(), 0)])
                .expect("Shopbring Staging telemetry url is valid; qed"),
        ),
        Some(DEFAULT_PROTOCOL_ID),
        shopbring_testnet_properties(),
        Default::default(),
    ))
}

fn shopbring_staging_config_genesis(wasm_binary: &[u8]) -> shopbring::GenesisConfig {
    testnet_genesis(
        wasm_binary,
        vec![
            (
                // 5CY5uxtxv69WJZeDQSgXWqMMouHzeEtwaD45wV6ZGEfFhjGD
                hex!["14e1e034cf6959daad8109a3eabb5e48b7e4e32fe7283052d3c0f7be7b194c0c"]
                    .unchecked_into(),
                // 5GeX6vQo31ZGPZbomyyQH4KJTWbkn6SF3praLLBgx9vMuJRU
                hex!["cabb13539d71aceb9e510aa8ecfbd946a3248f820ffe46f72fbcb5b54b50ce79"]
                    .unchecked_into(),
            ),
            (
                hex!["9aaa1558eec303495e93462cb02bae9b5870b2956383daa5604c4dac685ab60b"]
                    .unchecked_into(),
                hex!["4ebaccb49b8a8bee896c11b5b718a945af43de61335b3c22f6c29f25a6a849eb"]
                    .unchecked_into(),
            ),
        ],
        // 5CY5uxtxv69WJZeDQSgXWqMMouHzeEtwaD45wV6ZGEfFhjGD
        hex!["14e1e034cf6959daad8109a3eabb5e48b7e4e32fe7283052d3c0f7be7b194c0c"].into(),
        vec![
            // 5CY5uxtxv69WJZeDQSgXWqMMouHzeEtwaD45wV6ZGEfFhjGD
            hex!["14e1e034cf6959daad8109a3eabb5e48b7e4e32fe7283052d3c0f7be7b194c0c"].into(),
            hex!["9aaa1558eec303495e93462cb02bae9b5870b2956383daa5604c4dac685ab60b"].into(),
        ],
        vec![(SBG_ASSET_ID, AssetInfo::new(b"SBG".to_vec(), 8))],
        true,
    )
}

fn shopbring_testnet_properties() -> Option<Properties> {
    // Some JSON input data as a &str. Maybe this comes from the user.
    let data = r#"
        {
            "tokenDecimals": 8,
            "tokenSymbol": "SBG"
        }"#;

    // let properties: Option<Properties> = match serde_json::from_str(data) {
    //     Ok(v) => Some(v),
    //     Err(_) => None,
    // };

    let properties: Option<Properties> = serde_json::from_str(data).unwrap_or(None);
    return properties;
}
