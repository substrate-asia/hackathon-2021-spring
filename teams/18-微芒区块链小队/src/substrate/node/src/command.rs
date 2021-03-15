// This file is part of Substrate.

// Copyright (C) 2017-2020 Parity Technologies (UK) Ltd.
// SPDX-License-Identifier: Apache-2.0

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// 	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use crate::{chain_spec, service, network_config};
use crate::cli::{Cli, Subcommand};
use std;
use serde_yaml;
use sc_cli::{SubstrateCli, Role, RuntimeVersion, ChainSpec, OffchainWorkerEnabled};
use sc_service::{PartialComponents, config::{MultiaddrWithPeerId}};

impl SubstrateCli for Cli {
	fn impl_name() -> String {
		"Highway Node".into()
	}

	fn impl_version() -> String {
		env!("SUBSTRATE_CLI_IMPL_VERSION").into()
	}

	fn description() -> String {
		env!("CARGO_PKG_DESCRIPTION").into()
	}

	fn author() -> String {
		env!("CARGO_PKG_AUTHORS").into()
	}

	fn support_url() -> String {
		"support.anonymous.an".into()
	}

	fn copyright_start_year() -> i32 {
		2017
	}

	fn load_spec(&self, id: &str) -> Result<Box<dyn sc_service::ChainSpec>, String> {
		Ok(match std::env::var("NETWORK_CONFIG") {
			Ok(net_config_path) => Box::new(chain_spec::load_config(&net_config_path)?),
			Err(_) => {
				match id {
					"" | "local" | "dev" => Box::new(chain_spec::load_config("develop.yaml")?),
					path => Box::new(chain_spec::ChainSpec::from_json_file(
						std::path::PathBuf::from(path),
					)?),
				}
			},
		})
	}

	fn native_runtime_version(_: &Box<dyn ChainSpec>) -> &'static RuntimeVersion {
		&highway_runtime::VERSION
	}
}

/// Parse and run command line arguments
pub fn run() -> sc_cli::Result<()> {
	let mut cli = Cli::from_args();

	match &cli.subcommand {
		Some(Subcommand::Key(cmd)) => cmd.run(&cli),
		Some(Subcommand::NetworkConfig(cmd)) => cmd.run(),
		Some(Subcommand::BuildSpec(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.sync_run(|config| cmd.run(config.chain_spec, config.network))
		},
		Some(Subcommand::CheckBlock(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.async_run(|config| {
				let PartialComponents { client, task_manager, import_queue, ..}
					= service::new_partial(&config)?;
				Ok((cmd.run(client, import_queue), task_manager))
			})
		},
		Some(Subcommand::ExportBlocks(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.async_run(|config| {
				let PartialComponents { client, task_manager, ..}
					= service::new_partial(&config)?;
				Ok((cmd.run(client, config.database), task_manager))
			})
		},
		Some(Subcommand::ExportState(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.async_run(|config| {
				let PartialComponents { client, task_manager, ..}
					= service::new_partial(&config)?;
				Ok((cmd.run(client, config.chain_spec), task_manager))
			})
		},
		Some(Subcommand::ImportBlocks(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.async_run(|config| {
				let PartialComponents { client, task_manager, import_queue, ..}
					= service::new_partial(&config)?;
				Ok((cmd.run(client, import_queue), task_manager))
			})
		},
		Some(Subcommand::PurgeChain(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.sync_run(|config| cmd.run(config.database))
		},
		Some(Subcommand::Revert(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.async_run(|config| {
				let PartialComponents { client, task_manager, backend, ..}
					= service::new_partial(&config)?;
				Ok((cmd.run(client, backend), task_manager))
			})
		},
		None => {
			if let Some(group_name) = &cli.group_name  {
				if let Some(peer_name) = &cli.peer_name {
					let network_config_path = match std::env::var("NETWORK_CONFIG") {
						Ok(v) => v,
						Err(_) => String::from("develop.yaml"),
					};
					let contents = std::fs::read_to_string(
						std::path::PathBuf::from(network_config_path).as_path()
					).unwrap();
					let network_config: network_config::Network = serde_yaml::from_str(&contents).unwrap();
					let peer = network_config.peers.iter()
						.find(|peer| peer.group.eq(group_name) && peer.name.eq(peer_name));
					if let Some(peer) = peer {
						cli.run.validator = true;
						cli.run.offchain_worker_params.enabled = if peer.is_group_main {
							OffchainWorkerEnabled::WhenValidating
						} else {
							OffchainWorkerEnabled::Always
						};
						cli.run.name = Option::from(String::from(&format!("{}_{}", group_name, peer_name)));
						cli.run.ws_port = Option::from(peer.ws_port);
						cli.run.rpc_port = Option::from(peer.rpc_port);
						cli.run.network_params.port = Option::from(peer.port);
						cli.run.network_params.node_key_params.node_key = Option::from(peer.node_key.clone());

						let boot_peer = if peer.is_root {
							None
						} else if peer.is_group_main {
							network_config.peers.iter().find(|peer| peer.is_root)
						} else {
							network_config.peers.iter().find(|peer| peer.is_group_main && peer.group.eq(group_name))
						};

						if let Some(boot_peer) = boot_peer {
							let addr: MultiaddrWithPeerId = String::from(
								&format!(
									"/ip4/{}/tcp/{}/p2p/{}",
									boot_peer.ip,
									boot_peer.port,
									boot_peer.peer_id
								)
							).parse().unwrap();
							cli.run.network_params.bootnodes = vec![addr];
						}
					} else {
						println!("{}", &format!("Can't find peer info: {} for group: {}", peer_name, group_name));
						std::process::exit(1);
					}
				}
			}
			let runner = cli.create_runner(&cli.run)?;
			runner.run_node_until_exit(|config| async move {
				match config.role {
					Role::Light => service::new_light(config),
					_ => service::new_full(config),
				}.map_err(sc_cli::Error::Service)
			})
		}
	}
}
