use rbatis::core::db::DBPoolOptions;
use rbatis::rbatis::Rbatis;
use serde_derive::{Deserialize, Serialize};
use std::sync::Arc;

//******************************This is for register***************************************
// This is register for database to use
#[crud_enable]
#[derive(Clone, Debug)]
pub struct RegistersDB {
    pub id: Option<u64>,
    pub uuid: Option<String>,
    pub phone_number: Option<String>,
    pub password: Option<String>,
    pub web3_address: Option<String>,
    pub sign_time: Option<String>,
    pub login_time: Option<String>,
}

impl RegistersDB {
    pub fn from(register: Register) -> Self {
        Self {
            id: None,
            uuid: Some(register.uuid),
            phone_number: Some(register.phone_number),
            password: Some(register.password),
            web3_address: Some(register.web3_address),
            login_time: None,
            sign_time: None,
        }
    }
}

// This is for normal to use register
#[derive(Debug, Deserialize, Serialize, Clone, std::cmp::PartialEq)]
pub struct Register {
    // pub id: u64,
    pub uuid: String,
    pub phone_number: String,
    pub password: String,
    pub web3_address: String,
    // pub sign_time: String,
    // pub login_time: String,
}

impl Register {
    pub fn from(register_db: RegistersDB) -> Self {
        Self {
            // id: register_db.id.unwrap_or(0),
            uuid: register_db.uuid.unwrap_or("0".to_owned()),
            phone_number: register_db.phone_number.unwrap_or("0".to_owned()),
            password: register_db.password.unwrap_or("0".to_owned()),
            web3_address: register_db.web3_address.unwrap_or("0".to_owned()),
            // sign_time: register_db.sign_time.unwrap_or("0".to_owned()),
            // login_time: register_db.login_time.unwrap_or("0".to_owned()),
        }
    }
}

// **********************This is for login**********************************
#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Login {
    LOGIN1(Login1),
    LOGIN2(Login2),
}

// login by uuid a way
#[derive(Debug, Deserialize, Serialize, Clone, std::cmp::PartialEq)]
pub struct Login1 {
    pub uuid: String,
    pub password: String,
}

// login by phone number a way
#[derive(Debug, Deserialize, Serialize, Clone, std::cmp::PartialEq)]
pub struct Login2 {
    pub phone_number: String,
    pub password: String,
}
#[derive(Debug, Deserialize, Serialize, Clone, std::cmp::PartialEq)]
pub struct LoginGame {
    pub username: String,
    pub password: String,
}

// The query parameters for list_todos.
#[derive(Debug, Deserialize)]
pub struct ListOptions {
    pub offset: Option<usize>,
    pub limit: Option<usize>,
}

// ******************** This is for databases*****************************
// setting database url address
pub const MYSQL_URL: &str = "mysql://root:123456@47.98.193.249:3306/user";

pub async fn init_rbatis() -> Arc<Rbatis> {
    let rb = Rbatis::new();

    // 自定义连接池
    let mut opt = DBPoolOptions::new();
    opt.max_connections = 20;
    rb.link_opt(MYSQL_URL, &opt).await.unwrap();
    Arc::new(rb)
}

lazy_static! {
    // Rbatis是线程、协程安全的，运行时的方法是Send+Sync，无需担心线程竞争
    pub static ref RB: Rbatis = Rbatis::new();
}
//***************************************************************************
