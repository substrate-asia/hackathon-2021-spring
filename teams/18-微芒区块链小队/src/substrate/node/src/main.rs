//! Substrate Node Template CLI library.
#![warn(missing_docs)]

mod chain_spec;
#[macro_use]
mod service;
mod cli;
mod command;
mod rpc;
mod network_config_cmd;
mod network_describe_config;
mod network_config;

fn main() -> sc_cli::Result<()> {
	command::run()
}