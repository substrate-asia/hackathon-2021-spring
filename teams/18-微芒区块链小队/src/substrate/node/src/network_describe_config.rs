use serde::Deserialize;

fn default_ip() -> String {
    String::from("127.0.0.1")
}

fn default_as_false() -> bool {
    false
}

#[derive(Debug, PartialEq, Deserialize)]
pub struct Peer {
    pub name: String,

    #[serde(default="default_as_false")]
    pub is_root: bool,

    #[serde(default="default_as_false")]
    pub is_group_main: bool,

    #[serde(default="default_ip")]
    pub ip: String,

    pub port: u16,
    pub ws_port: u16,
    pub rpc_port: u16,
}

#[derive(Debug, PartialEq, Deserialize)]
pub struct Group {
    pub name: String,
    pub peers: Vec<Peer>,
}

#[derive(Debug, PartialEq, Deserialize)]
pub struct Network {
    pub id: String,
    pub name: String,
    pub groups: Vec<Group>,
}