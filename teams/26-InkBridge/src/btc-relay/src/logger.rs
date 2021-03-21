use log4rs::{
    append::{
        console,
        rolling_file::{self, policy},
    },
    config,
    encode::pattern::PatternEncoder,
};

use crate::{cmd::Config, error::Result};

const MB_SIZE: u64 = 1024 * 1024; // 1 MB

#[macro_export]
macro_rules! error {
    (target: $target:expr, $($arg:tt)+) => (
        log::error!(target: $target, "{}", format!($($arg)*));
    );
    ($($arg:tt)*) => (
        log::error!(target: "relay", "{}", format!($($arg)*));
    )
}

#[macro_export]
macro_rules! warn {
    (target: $target:expr, $($arg:tt)+) => (
        log::warn!(target: $target, "{}", format!($($arg)*));
    );
    ($($arg:tt)*) => (
        log::warn!(target: "relay", "{}", format!($($arg)*));
    )
}

#[macro_export]
macro_rules! info {
    (target: $target:expr, $($arg:tt)+) => (
        log::info!(target: $target, "{}", format!($($arg)*));
    );
    ($($arg:tt)*) => (
        log::info!(target: "relay", "{}", format!($($arg)*));
    )
}

#[macro_export]
macro_rules! debug {
    (target: $target:expr, $($arg:tt)+) => (
        log::debug!(target: $target, "{}", format!($($arg)*));
    );
    ($($arg:tt)*) => (
        log::debug!(target: "relay", "{}", format!($($arg)*));
    )
}

#[macro_export]
macro_rules! trace {
    (target: $target:expr, $($arg:tt)+) => (
        log::trace!(target: $target, "{}", format!($($arg)*));
    );
    ($($arg:tt)*) => (
        log::trace!(target: "relay", "{}", format!($($arg)*));
    )
}

pub fn init(conf: &Config) -> Result<()> {
    init_log4rs_with_config(&conf)?;
    version_info();
    info!(
        "Log: [level: {}, path: {:?}, roll size: {} MB, roll count: {}]",
        conf.log_level, conf.log_path, conf.log_roll_size, conf.log_roll_count
    );
    // info!(
    //     "Bitcoin: [{}://{}:{}]",
    //     conf.btc_url.scheme(),
    //     conf.btc_url.host_str().unwrap(),
    //     conf.btc_url.port().unwrap()
    // );
    // info!("Realyer: [{}]", conf.btc_url);
    info!(
        "Bitcoin Block Waiting Interval: [{} seconds]",
        conf.btc_block_interval
    );
    info!("Realyer: [{}]", conf.patra_url);
    info!("Realyer Push Header Only: [{}]", conf.only_header);
    Ok(())
}

fn init_log4rs_with_config(conf: &Config) -> Result<()> {
    let pattern = "{d(%Y-%m-%d %H:%M:%S)} {h({l})} - {m}\n";

    let console = console::ConsoleAppender::builder()
        .encoder(Box::new(PatternEncoder::new(pattern)))
        .build();

    let trigger = policy::compound::trigger::size::SizeTrigger::new(conf.log_roll_size * MB_SIZE);
    let roll_pattern = format!("{}.{{}}.gz", conf.log_path.display());
    let roll = policy::compound::roll::fixed_window::FixedWindowRoller::builder()
        .build(roll_pattern.as_str(), conf.log_roll_count)
        .expect("Building fixed window roller shouldn't be fail");
    let policy = policy::compound::CompoundPolicy::new(Box::new(trigger), Box::new(roll));
    let roll_file = rolling_file::RollingFileAppender::builder()
        .encoder(Box::new(PatternEncoder::new(pattern)))
        .build(&conf.log_path, Box::new(policy))?;

    let log_config_builder = config::Config::builder()
        .appender(config::Appender::builder().build("console", Box::new(console)))
        .appender(config::Appender::builder().build("roll", Box::new(roll_file)))
        .logger(
            config::Logger::builder()
                .appender("console")
                .appender("roll")
                .build("relay", conf.log_level),
        );

    let root = config::Root::builder().build(conf.log_level);
    let log_config = log_config_builder
        .build(root)
        .expect("Building log config shouldn't be fail");

    log4rs::init_config(log_config).expect("Initializing log config shouldn't be fail");
    Ok(())
}

fn version_info() {
    info!("================================================================================");
    info!(
        "Release Version:   {}",
        option_env!("CARGO_PKG_VERSION").unwrap_or("Unknown")
    );
    info!(
        "Git Commit Hash:   {}",
        option_env!("BUILD_GIT_HASH").unwrap_or("Unknown")
    );
    info!(
        "Git Commit Branch: {}",
        option_env!("BUILD_GIT_BRANCH").unwrap_or("Unknown")
    );
    info!(
        "Rust Version:      {}",
        option_env!("BUILD_RUSTC_VERSION").unwrap_or("Unknown")
    );
    info!("================================================================================");
}
