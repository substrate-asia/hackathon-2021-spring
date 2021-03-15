use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Deserialize, Serialize)]
pub struct Secret {
    pub phrase: String,
    pub seed: String,
    pub sr25519_public_key: String,
    pub sr25519_ss58_address: String,
    pub ed25519_public_key: String,
    pub ed25519_ss58_address: String,
}

#[derive(Debug, PartialEq, Deserialize, Serialize)]
pub struct Peer {
    pub name: String,
    pub group: String,
    pub is_root: bool,
    pub is_group_main: bool,
    pub ip: String,
    pub port: u16,
    pub ws_port: u16,
    pub rpc_port: u16,
    pub node_key: String,
    pub peer_id: String,
    pub peer_id_hex: String,
    pub secret: Secret,
}

#[derive(Debug, PartialEq, Deserialize, Serialize)]
pub struct Network {
    pub id: String,
    pub name: String,
    pub peers: Vec<Peer>,
}