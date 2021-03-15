//! Support code for mintcraft.

#![cfg_attr(not(feature = "std"), no_std)]

/// Export ourself as `mc_support` to make tests happy.
extern crate self as mc_support;

pub mod primitives;
pub mod traits;
