use structopt::StructOpt;
use sc_cli::RunCmd;
use crate::network_config_cmd::NetworkConfigCmd;

#[derive(Debug, StructOpt)]
pub struct Cli {
	#[structopt(subcommand)]
	pub subcommand: Option<Subcommand>,

	#[structopt(flatten)]
	pub run: RunCmd,

	/// Group name
	#[structopt(short, long)]
	pub group_name: Option<String>,

	/// Peer name
	#[structopt(short, long)]
	pub peer_name: Option<String>,
}

#[derive(Debug, StructOpt)]
pub enum Subcommand {
	/// Key management cli management.
	Key(sc_cli::KeySubcommand),

	/// Parse network configurations.
	NetworkConfig(NetworkConfigCmd),

	/// Build a chain specification.
	BuildSpec(sc_cli::BuildSpecCmd),

	/// Validate blocks.
	CheckBlock(sc_cli::CheckBlockCmd),

	/// Export blocks.
	ExportBlocks(sc_cli::ExportBlocksCmd),

	/// Export the state of a given block into a chain spec.
	ExportState(sc_cli::ExportStateCmd),

	/// Import blocks.
	ImportBlocks(sc_cli::ImportBlocksCmd),

	/// Remove the whole chain.
	PurgeChain(sc_cli::PurgeChainCmd),

	/// Revert the chain to a previous state.
	Revert(sc_cli::RevertCmd),
}
