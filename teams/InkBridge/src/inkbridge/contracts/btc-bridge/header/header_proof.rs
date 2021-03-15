use core::cmp;

use ink_env::Hash;
use ink_lang::Env;

use crate::btc_bridge::{BtcBridge, Error, Result};
use crate::types::{BtcHeader, BtcHeaderInfo, BtcParams, Compact};
use ink_log::{Level, LogRecord};
use ink_prelude::{format, vec::Vec};
use primitive_types::U256;

pub struct HeaderVerifier<'a> {
    params: BtcParams,
    pub work: HeaderWork<'a>,
    pub proof_of_work: HeaderProofOfWork<'a>,
    pub timestamp: HeaderTimestamp<'a>,
}

impl<'a> HeaderVerifier<'a> {
    pub fn new(store: &'a BtcBridge, header_info: &'a BtcHeaderInfo) -> Self {
        // TODO change env::Moment max_value is u64 max_value
        let now: u64 = store.env().block_timestamp();
        // if convert from u64 to u32 failed (unix timestamp should not be greater than u32::MAX),
        // ignore timestamp check, timestamp check are not important
        // let current_time = u32::try_from(now.as_secs()).ok();
        // TODO simple handle
        let current_time = Some((now / 1000) as u32);

        Self {
            params: store.params_info,
            work: HeaderWork::new(store, header_info),
            proof_of_work: HeaderProofOfWork::new(store, &header_info.header),
            timestamp: HeaderTimestamp::new(store, &header_info.header, current_time),
        }
    }

    pub fn check(&self) -> Result<()> {
        // let params: BtcParams = Module::<T>::params_info();

        // let network_id: Network = Module::<T>::network_id();
        // if let Network::Mainnet = network_id {
        // TODO add testnet config
        self.work.check(&self.params)?;
        // }
        self.proof_of_work.check(&self.params)?;
        self.timestamp.check(&self.params)?;

        Ok(())
    }
}

pub enum RequiredWork {
    Value(Compact),
    NotCheck,
}

pub struct HeaderWork<'a> {
    store: &'a BtcBridge,
    info: &'a BtcHeaderInfo,
}

impl<'a> HeaderWork<'a> {
    fn new(store: &'a BtcBridge, info: &'a BtcHeaderInfo) -> Self {
        HeaderWork { store, info }
    }

    fn check(&self, params: &BtcParams) -> Result<()> {
        let previous_header_hash = hash_rev(self.info.header.previous_header_hash);
        let work = work_required(&self.store, previous_header_hash, self.info.height, params);
        match work {
            RequiredWork::Value(work) => {
                if work != self.info.header.bits {
                    let message = format!("[check_header_work] nBits do not match difficulty rules, work:{:?}, header bits:{:?}, height:{}",
                                          work, self.info.header.bits, self.info.height);
                    log_print(message.as_str(), Level::Error as u32, self.store);

                    return Err(Error::HeaderNBitsNotMatch);
                }
                Ok(())
            }
            RequiredWork::NotCheck => Ok(()),
        }
    }
}

pub fn work_required(
    store: &BtcBridge,
    parent_hash: Hash,
    height: u32,
    params: &BtcParams,
) -> RequiredWork {
    let max_bits = params.max_bits();
    if height == 0 {
        return RequiredWork::Value(max_bits);
    }

    // let parent_header: BtcHeader = Module::<T>::headers(&parent_hash)
    //     .expect("pre header must exist here")
    //     .header;
    let parent_header = store
        .headers
        .get(&parent_hash)
        .expect("pre header must exist here")
        .1
        .header;

    if is_retarget_height(height, params) {
        let new_work = work_required_retarget(store, parent_header, height, params);

        let message = format!(
            "[work_required] Retarget new work required, height:{}, retargeting_interval:{}",
            height,
            params.retargeting_interval()
        );
        log_print(message.as_str(), Level::Info as u32, store);

        return new_work;
    }

    let message = format!(
        "[work_required] Use old work required, old bits:{:?}",
        parent_header.bits
    );
    log_print(message.as_str(), Level::Info as u32, store);

    RequiredWork::Value(parent_header.bits)
}

fn is_retarget_height(height: u32, params: &BtcParams) -> bool {
    height % params.retargeting_interval() == 0
}

/// Algorithm used for retargeting work every 2 weeks
fn work_required_retarget(
    store: &BtcBridge,
    parent_header: BtcHeader,
    height: u32,
    params: &BtcParams,
) -> RequiredWork {
    let retarget_num = height - params.retargeting_interval();

    // timestamp of parent block
    let last_timestamp = parent_header.time;
    // bits of last block
    let last_bits = parent_header.bits;

    // let (_, genesis_height) = Module::<T>::genesis_info();
    let genesis_height = store.genesis_info.height;
    let mut retarget_header = parent_header;
    if retarget_num < genesis_height {
        // retarget_header = genesis_header;
        return RequiredWork::NotCheck;
    } else {
        // let hash_list = Module::<T>::block_hash_for(&retarget_num);
        if let Some(hash_list) = store.block_hash_for.get(&retarget_num) {
            for h in hash_list {
                // look up in main chain
                // if Module::<T>::main_chain(h) {
                if store.main_chain.get(h).map(|a| *a).unwrap_or_default() {
                    // let info = Module::<T>::headers(h).expect("block header must exist at here.");
                    let info = store
                        .headers
                        .get(h)
                        .expect("block header must exist at here.")
                        .1;
                    retarget_header = info.header;
                    break;
                };
            }
        }
    }
    // timestamp of block(height - RETARGETING_INTERVAL)
    let retarget_timestamp = retarget_header.time;

    let mut retarget: U256 = last_bits.into();
    let maximum: U256 = params.max_bits().into();
    //
    retarget *= U256::from(retarget_timespan(
        retarget_timestamp,
        last_timestamp,
        params,
    ));
    retarget /= U256::from(params.target_timespan_seconds());

    let message = format!(
        "[work_required_retarget] retarget:{}, maximum:{:?}",
        retarget, maximum
    );
    log_print(message.as_str(), Level::Info as u32, store);

    RequiredWork::Value(if retarget > maximum {
        params.max_bits()
    } else {
        retarget.into()
    })
}

/// Returns constrained number of seconds since last retarget
fn retarget_timespan(retarget_timestamp: u32, last_timestamp: u32, params: &BtcParams) -> u32 {
    // TODO i64??
    // subtract unsigned 32 bit numbers in signed 64 bit space in
    // order to prevent underflow before applying the range constraint.
    let timespan = last_timestamp as i64 - i64::from(retarget_timestamp);
    range_constrain(
        timespan,
        i64::from(params.min_timespan()),
        i64::from(params.max_timespan()),
    ) as u32
}

fn range_constrain(value: i64, min: i64, max: i64) -> i64 {
    cmp::min(cmp::max(value, min), max)
}

pub struct HeaderProofOfWork<'a> {
    store: &'a BtcBridge,
    header: &'a BtcHeader,
}

impl<'a> HeaderProofOfWork<'a> {
    fn new(store: &'a BtcBridge, header: &'a BtcHeader) -> Self {
        Self { store, header }
    }

    fn check(&self, params: &BtcParams) -> Result<()> {
        if is_valid_proof_of_work(
            params.max_bits(),
            self.header.bits,
            self.header.hash(),
            self.store,
        ) {
            Ok(())
        } else {
            Err(Error::InvalidPoW)
        }
    }
}

pub fn hash_rev<T: AsMut<[u8]>>(mut hash: T) -> T {
    let bytes = hash.as_mut();
    bytes.reverse();
    hash
}

fn is_valid_proof_of_work(
    max_work_bits: Compact,
    bits: Compact,
    hash: Hash,
    store: &BtcBridge,
) -> bool {
    match (max_work_bits.to_u256(), bits.to_u256()) {
        (Ok(maximum), Ok(target)) => {
            let value = U256::from(hash.as_ref());
            let message = format!(
                "[is_valid_proof_of_work] target: {}, maximum: {}, hash::{:?} value: {}",
                target, maximum, hash, value
            );
            log_print(message.as_str(), Level::Info as u32, store);
            target <= maximum && value <= target
        }
        _ => false,
    }
}

pub struct HeaderTimestamp<'a> {
    store: &'a BtcBridge,
    header: &'a BtcHeader,
    current_time: Option<u32>,
}

impl<'a> HeaderTimestamp<'a> {
    fn new(store: &'a BtcBridge, header: &'a BtcHeader, current_time: Option<u32>) -> Self {
        Self {
            store,
            header,
            current_time,
        }
    }

    #[allow(unused)]
    fn check(&self, params: &BtcParams) -> Result<()> {
        if let Some(current_time) = self.current_time {
            if self.header.time > current_time + params.block_max_future() {
                let message = format!(
                    "[check_header_timestamp] Header time:{}, current time:{}, max_future{:?}",
                    self.header.time,
                    current_time,
                    params.block_max_future()
                );
                log_print(message.as_str(), Level::Error as u32, self.store);
                Err(Error::HeaderFuturisticTimestamp)
            } else {
                Ok(())
            }
        } else {
            // if get chain timestamp error, just ignore blockhead time check
            let message = format!(
                "[check_header_timestamp] Header:{:?}, get unix timestamp error, ignore it",
                hash_rev(self.header.hash())
            );
            log_print(message.as_str(), Level::Warn as u32, self.store);
            Ok(())
        }
    }
}

// TODO product network disable log
pub fn log_print(msg: &str, lv: u32, store: &BtcBridge) {
    store.env().extension().log(LogRecord {
        level: lv,
        target: Vec::from("patra-btc/header"),
        args: Vec::from(msg),
    });
}
