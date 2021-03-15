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
// --- std ---
// use std::path::PathBuf;

use crate::cli::{Cli, Subcommand};
use sc_cli::{SubstrateCli, RuntimeVersion, Role, ChainSpec};
// use sc_service::PartialComponents;
use sp_core::crypto::Ss58AddressFormat;
// use uniarts_primitives::{OpaqueBlock as Block};
use uniarts_service::{pangu_runtime, fuxi_runtime, IdentifyVariant};
use log::info;

const UNI_ARTS_ADDRESS_FORMAT_ID: u8 = 45;

impl SubstrateCli for Cli {
	fn impl_name() -> String {
		"Uni-arts Node".into()
	}

	fn impl_version() -> String {
		env!("SUBSTRATE_CLI_IMPL_VERSION").into()
	}

	fn executable_name() -> String { "uniarts".into() }

	fn description() -> String {
		env!("CARGO_PKG_DESCRIPTION").into()
	}

	fn author() -> String {
		env!("CARGO_PKG_AUTHORS").into()
	}

	fn support_url() -> String {
		"https://github.com/uni-arts-chain/uni-arts-network/issues".into()
	}

	fn copyright_start_year() -> i32 {
		2020
	}

	fn load_spec(&self, id: &str) -> Result<Box<dyn sc_service::ChainSpec>, String> {
		let id = if id.is_empty() {
			let n = get_exec_name().unwrap_or_default();
			["uart", "pangu", "fuxi"]
				.iter()
				.cloned()
				.find(|&chain| n.starts_with(chain))
				.unwrap_or("uart")
		} else {
			id
		};

		Ok(match id {
			"dev" => Box::new(uniarts_service::chain_spec::fuxi_development_config()?),
			"" | "local" => Box::new(uniarts_service::chain_spec::pangu_local_testnet_config()?),
			"staging" => Box::new(uniarts_service::chain_spec::staging_config()?),
			"uart" => Box::new(uniarts_service::chain_spec::pangu_config()?),
			"pangu" => Box::new(uniarts_service::chain_spec::pangu_config()?),
			"fuxi" => Box::new(uniarts_service::chain_spec::fuxi_config()?),
			path => Box::new(uniarts_service::chain_spec::PanguChainSpec::from_json_file(
				std::path::PathBuf::from(path),
			)?),
		})
	}

	fn native_runtime_version(spec: &Box<dyn ChainSpec>) -> &'static RuntimeVersion {
		if spec.is_pangu_network() {
			&uniarts_service::pangu_runtime::VERSION
		} else if spec.is_fuxi_network() {
			&uniarts_service::fuxi_runtime::VERSION
		} else {
			&uniarts_service::pangu_runtime::VERSION
		}
	}
}

fn get_exec_name() -> Option<String> {
	std::env::current_exe()
		.ok()
		.and_then(|pb| pb.file_name().map(|s| s.to_os_string()))
		.and_then(|s| s.into_string().ok())
}

fn set_default_ss58_version(spec: &Box<dyn uniarts_service::ChainSpec>) {
	let ss58_version = if spec.is_pangu_network() {
		Ss58AddressFormat::SubstrateAccount
	} else if spec.is_fuxi_network() {
		// todo
		// Waiting for release: uniart address id
		Ss58AddressFormat::Custom(UNI_ARTS_ADDRESS_FORMAT_ID)
	} else {
		Ss58AddressFormat::SubstrateAccount
	};

	sp_core::crypto::set_default_ss58_version(ss58_version);
}

/// Parse and run command line arguments
pub fn run() -> sc_cli::Result<()> {
	let cli = Cli::from_args();

	match &cli.subcommand {
		Some(Subcommand::BuildSpec(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.sync_run(|config| cmd.run(config.chain_spec, config.network))
		},
		Some(Subcommand::CheckBlock(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			let chain_spec = &runner.config().chain_spec;

			set_default_ss58_version(chain_spec);

			if chain_spec.is_pangu_network() {
				runner.async_run(|mut config| {
					let (client, _, import_queue, task_manager) = uniarts_service::new_chain_ops::<
						pangu_runtime::RuntimeApi,
						uniarts_service::PanguExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, import_queue), task_manager))
				})
			} else if chain_spec.is_fuxi_network() {
				runner.async_run(|mut config| {
					let (client, _, import_queue, task_manager) = uniarts_service::new_chain_ops::<
						fuxi_runtime::RuntimeApi,
						uniarts_service::FuxiExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, import_queue), task_manager))
				})
			} else {
				unreachable!()
			}

		},
		Some(Subcommand::ExportBlocks(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			let chain_spec = &runner.config().chain_spec;

			set_default_ss58_version(chain_spec);

			if chain_spec.is_pangu_network() {
				runner.async_run(|mut config| {
					let (client, _, _, task_manager) = uniarts_service::new_chain_ops::<
						pangu_runtime::RuntimeApi,
						uniarts_service::PanguExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, config.database), task_manager))
				})
			} else if chain_spec.is_fuxi_network() {
				runner.async_run(|mut config| {
					let (client, _, _, task_manager) = uniarts_service::new_chain_ops::<
						fuxi_runtime::RuntimeApi,
						uniarts_service::FuxiExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, config.database), task_manager))
				})
			} else {
				unreachable!()
			}
		},
		Some(Subcommand::ExportState(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			let chain_spec = &runner.config().chain_spec;

			set_default_ss58_version(chain_spec);

			if chain_spec.is_pangu_network() {
				runner.async_run(|mut config| {
					let (client, _, _, task_manager) = uniarts_service::new_chain_ops::<
						pangu_runtime::RuntimeApi,
						uniarts_service::PanguExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, config.chain_spec), task_manager))
				})
			} else if chain_spec.is_fuxi_network() {
				runner.async_run(|mut config| {
					let (client, _, _, task_manager) = uniarts_service::new_chain_ops::<
						fuxi_runtime::RuntimeApi,
						uniarts_service::FuxiExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, config.chain_spec), task_manager))
				})
			} else {
				unreachable!()
			}
		},
		Some(Subcommand::ImportBlocks(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			let chain_spec = &runner.config().chain_spec;

			set_default_ss58_version(chain_spec);

			if chain_spec.is_pangu_network() {
				runner.async_run(|mut config| {
					let (client, _, import_queue, task_manager) = uniarts_service::new_chain_ops::<
						pangu_runtime::RuntimeApi,
						uniarts_service::PanguExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, import_queue), task_manager))
				})
			} else if chain_spec.is_fuxi_network() {
				runner.async_run(|mut config| {
					let (client, _, import_queue, task_manager) = uniarts_service::new_chain_ops::<
						fuxi_runtime::RuntimeApi,
						uniarts_service::FuxiExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, import_queue), task_manager))
				})
			} else {
				unreachable!()
			}
		},
		Some(Subcommand::PurgeChain(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			runner.sync_run(|config| cmd.run(config.database))
		},
		Some(Subcommand::Revert(cmd)) => {
			let runner = cli.create_runner(cmd)?;
			let chain_spec = &runner.config().chain_spec;

			set_default_ss58_version(chain_spec);

			if chain_spec.is_pangu_network() {
				runner.async_run(|mut config| {
					let (client, backend, _, task_manager) = uniarts_service::new_chain_ops::<
						pangu_runtime::RuntimeApi,
						uniarts_service::PanguExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, backend), task_manager))
				})
			} else if chain_spec.is_fuxi_network() {
				runner.async_run(|mut config| {
					let (client, backend, _, task_manager) = uniarts_service::new_chain_ops::<
						fuxi_runtime::RuntimeApi,
						uniarts_service::FuxiExecutor,
					>(&mut config)?;

					Ok((cmd.run(client, backend), task_manager))
				})
			} else {
				unreachable!()
			}
		},
		None => {
			let runner = cli.create_runner(&cli.run)?;
			let chain_spec = &runner.config().chain_spec;

			set_default_ss58_version(chain_spec);

			info!("  _    _       _                    _          _____ _           _       ");
			info!(" | |  | |     (_)        /\\        | |        / ____| |         (_)      ");
			info!(" | |  | |_ __  _ ______ /  \\   _ __| |_ ___  | |    | |__   __ _ _ _ __  ");
			info!(" | |  | | '_ \\| |______/ /\\ \\ | '__| __/ __| | |    | '_ \\ / _` | | '_ \\ ");
			info!(" | |__| | | | | |     / ____ \\| |  | |_\\__ \\ | |____| | | | (_| | | | | |");
			info!("  \\____/|_| |_|_|    /_/    \\_\\_|   \\__|___/  \\_____|_| |_|\\__,_|_|_| |_|");
			info!("                                                                         ");
			info!("                                                                         ");
			info!("  by Uni-Arts Network, 2018-2020");

			if chain_spec.is_pangu_network() {
				runner.run_node_until_exit(|config| match config.role {
					Role::Light => uniarts_service::pangu_new_light(config),
					_ => uniarts_service::pangu_new_full(config).map(|(components, _)| components),
				})
			} else if chain_spec.is_fuxi_network() {
				runner.run_node_until_exit(|config| match config.role {
					Role::Light => uniarts_service::fuxi_new_light(config),
					_ => uniarts_service::fuxi_new_full(config).map(|(components, _)| components),
				})
			} else {
				unreachable!()
			}
		}
	}
}
