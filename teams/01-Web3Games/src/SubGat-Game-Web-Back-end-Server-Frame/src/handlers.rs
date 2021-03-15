/// These are our API handlers, the ends of each filter chain.
/// Notice how thanks to using `Filter::and`, we can define a function
/// with the exact arguments we'd expect from each filter in the chain.
/// No tuples are needed, it's auto flattened for the functions.
use super::db::{ListOptions, Login, Login1, Login2, LoginGame, Register, RegistersDB};
use rbatis::crud::CRUD;
use rbatis::rbatis::Rbatis;
use rbatis::Error;
use std::convert::Infallible;
use std::sync::Arc;
use warp::http::{self, StatusCode};
use warp::reply::Response;
use warp::Reply;
use chrono::{DateTime, Utc};

pub async fn list_user(
    _opts: ListOptions,
    db: Arc<Rbatis>,
) -> Result<impl warp::Reply, Infallible> {
    log::debug!("list_user");

    let registers: Result<Vec<RegistersDB>, Error> = db.fetch_list("").await;
    registers.as_ref().map_or_else(
        |_error| {
            log::debug!("user is empty!");
            Ok(get_response(
                warp::reply::json(&Vec::<Register>::new()),
                StatusCode::OK,
            ))
        },
        |_| {
            let registers: Vec<Register> = registers
                .as_ref()
                .unwrap()
                .into_iter()
                .map(|val| Register::from(val.clone()))
                .collect();
            log::debug!("users is {:?}", registers);
            Ok(get_response(warp::reply::json(&registers), StatusCode::OK))
        },
    )
}

// login by Login1
pub async fn login_by_uuid(par: Login1, db: Arc<Rbatis>) -> Result<impl warp::Reply, Infallible> {
    login(Login::LOGIN1(par), db.clone()).await
}

// login by Login2
pub async fn login_by_phone_number(
    par: Login2,
    db: Arc<Rbatis>,
) -> Result<impl warp::Reply, Infallible> {
    login(Login::LOGIN2(par), db.clone()).await
}

async fn login(login: Login, db: Arc<Rbatis>) -> Result<impl warp::Reply, Infallible> {
    match login {
        Login::LOGIN1(Login1 { uuid, password }) => {
            log::debug!("uuid = {}, password = {}", uuid, password);
            let w = db.new_wrapper().eq("uuid", &uuid);
            let ret: Result<Option<RegistersDB>, Error> = db.fetch_by_wrapper("", &w).await;
            match ret {
                Ok(some) => {
                    match some {
                        None => {
                            log::debug!("login error: search result is None value by uuid");
                            return Ok(get_response(
                                "login error: search result is None value by uuid",
                                http::StatusCode::BAD_REQUEST,
                            ));
                        },
                        Some(res ) => {
                            log::debug!("register db = {:?}", res);
                            let res_password = res.password.clone();
                            if res_password.unwrap() == password {
                                log::debug!("login success");
                                let mut login_user = res;
                                let now: DateTime<Utc> = Utc::now();
                                login_user.login_time = Some(format!("{}", now));

                                let update_uuid = login_user.uuid.clone();
                                let w = db
                                    .new_wrapper()
                                    .eq("uuid", &update_uuid.unwrap());

                                let update_id = db.update_by_wrapper("", &mut login_user, &w, false).await;

                                update_id.map_or_else(
                                    |_error| {
                                        // If the for loop didn't return OK, then the ID doesn't exist...
                                        log::debug!("    -> register id not found!");
                                    },
                                    |update_id| {
                                        log::debug!("update register, res: {}", update_id);
                                    },
                                );
                                return Ok(get_response("PASSWORD SUCCEESS", http::StatusCode::OK));
                            } else {
                                log::debug!("login failed");
                                return Ok(get_response(
                                    "PASSWORD ERROR",
                                    http::StatusCode::NOT_FOUND,
                                ));
                            }
                        }
                    }
                },
                Err(_error) => {
                    log::debug!("login error[{:?}]: search none thing by uuid", _error);
                    return Ok(get_response(
                        "login error: search none thing by uuid",
                        StatusCode::BAD_REQUEST,
                    ));
                }
            }
        }
        Login::LOGIN2(Login2 {
            phone_number,
            password,
        }) => {
            let w = db.new_wrapper().eq("phone_number", &phone_number);
            let r: Result<Option<RegistersDB>, Error> = db.fetch_by_wrapper("", &w).await;
            match r {
                Ok(some) => {
                    match some {
                        Some(res) => {
                            let res_password = res.password.clone();
                            log::debug!("register db = {:?}", res);
                            if res_password.unwrap() == password {
                                log::debug!("login success");

                                let mut login_user = res;
                                let now: DateTime<Utc> = Utc::now();
                                login_user.login_time = Some(format!("{}", now));

                                let update_uuid = login_user.uuid.clone();
                                let w = db
                                    .new_wrapper()
                                    .eq("uuid", &update_uuid.unwrap());

                                let update_id = db.update_by_wrapper("", &mut login_user, &w, false).await;

                                update_id.map_or_else(
                                    |_error| {
                                        // If the for loop didn't return OK, then the ID doesn't exist...
                                        log::debug!("    -> register id not found!");
                                    },
                                    |update_id| {
                                        log::debug!("update register, res: {}", update_id);
                                    },
                                );
                                return Ok(get_response("PASSWORD SUCCEESS", http::StatusCode::OK));
                            } else {
                                log::debug!("login failed");
                                return Ok(get_response(
                                    "PASSWORD ERROR",
                                    http::StatusCode::NOT_FOUND,
                                ));
                            }
                        },
                        None => {
                            log::debug!("login error: search result is None value by phone number");
                            return Ok(get_response(
                                "login error: search result is None value by phone number",
                                http::StatusCode::BAD_REQUEST,
                            ));
                        }
                    }
                },
                Err(_error) => {
                    log::debug!("login error[{:?}]: search none thing by phone number", _error);
                    return Ok(get_response(
                        "login error: search none thing by phone number",
                        http::StatusCode::BAD_REQUEST,
                    ));
                }
            }
        }
    }
}

pub async fn login_game(login: LoginGame, db: Arc<Rbatis>) -> Result<impl warp::Reply, Infallible> {
    let w = db
        .new_wrapper()
        .eq("uuid", &login.username)
        .or()
        .eq("phone_number", &login.username);

    let res: Result<Option<RegistersDB>, Error> = db.fetch_by_wrapper("", &w).await;
    match res {
        Ok(r) if r.is_some() => {
            let r = r.unwrap();
            Ok(get_response(
                format!(
                    "{{\"web3_address\": \"{}\"}}",
                    r.web3_address.unwrap_or("".to_owned())
                ),
                StatusCode::OK,
            ))
        }
        _ => Ok(get_response("", StatusCode::OK)),
    }
}

// 创建用户
pub async fn create_user(
    create: Register,
    db: Arc<Rbatis>,
) -> Result<impl warp::Reply, Infallible> {
    // 用户请求的合法性判断
    log::debug!("create_register: {:?}", create);
    let mut create_register_db = RegistersDB::from(create.clone());
    let now: DateTime<Utc> = Utc::now();
    let sign_time = Some(format!("{}", now));
    let login_time = Some(format!("{}", now));
    create_register_db.sign_time = sign_time;
    create_register_db.login_time = login_time;

    // 通过uuid唯一的标示
    let create_uuid = create.uuid;
    let create_phone_number = create.phone_number;
    let create_web3_address = create.web3_address;
    let w = db
        .new_wrapper()
        .eq("uuid", &create_uuid)
        .or()
        .eq("phone_number", &create_phone_number)
        .or()
        .eq("web3_address", &create_web3_address);

    let ret_create_register_db: Result<Vec<RegistersDB>, Error> =
        db.fetch_list_by_wrapper("", &w).await;

    match ret_create_register_db {
        Err(_err) => {
            log::debug!("search register by id error ");
            Ok(get_response(
                "search register by id error",
                http::StatusCode::BAD_REQUEST,
            ))
        }
        Ok(res) => {
            if res.is_empty() {
                let r = db.save("", &create_register_db).await;
                r.map_or_else(
                    |error| {
                        log::debug!("create_resister: {}", error);
                        Ok(get_response(
                            "create user failed",
                            http::StatusCode::NOT_FOUND,
                        ))
                    },
                    |_| {
                        Ok(get_response(
                            "create user success",
                            http::StatusCode::CREATED,
                        ))
                    },
                )
            } else {
                log::debug!(
                    "    -> id already exists (uuid :{}, phone number: {}, web3 address: {})",
                    create_uuid,
                    create_phone_number,
                    create_web3_address
                );
                Ok(get_response(
                    "user already exists",
                    http::StatusCode::BAD_REQUEST,
                ))
            }
        }
    }
}

// 更新用户
pub async fn update_user(
    // id: u64,
    update: Register,
    db: Arc<Rbatis>,
) -> Result<impl warp::Reply, Infallible> {
    // log::debug!("update_register: id={}, register={:?}", id, update);

    let mut update_register_db = RegistersDB::from(update.clone());
    let now: DateTime<Utc> = Utc::now();
    update_register_db.login_time = Some(format!("{}", now));

    let update_uuid = update_register_db.uuid.clone();
    let w = db
        .new_wrapper()
        .eq("uuid", &update_uuid.unwrap());

    let update_id = db.update_by_wrapper("", &mut update_register_db, &w, false).await;

    update_id.map_or_else(
        |_error| {
            // If the for loop didn't return OK, then the ID doesn't exist...
            log::debug!("    -> register id not found!");
            Ok(get_response(
                "user id not found",
                http::StatusCode::NOT_FOUND,
            ))
        },
        |update_id| {
            log::debug!("update register, res: {}", update_id);
            Ok(get_response("update success", http::StatusCode::OK))
        },
    )
}

// 删除用户
pub async fn delete_user(id: u64, db: Arc<Rbatis>) -> Result<impl warp::Reply, Infallible> {
    log::debug!("delete_register: id={}", id);

    let delete_id = db.remove_by_id::<RegistersDB>("", &id).await;
    delete_id.map_or_else(
        |_err| {
            log::debug!("    -> user id not found!");
            Ok(get_response(
                "user id not found!",
                http::StatusCode::NOT_FOUND,
            ))
        },
        |delete_id| {
            log::debug!("delete_user: ret: {}, id: {}", delete_id, id);
            Ok(get_response("delete user success", http::StatusCode::OK))
        },
    )
}

fn get_response<T: Reply>(reply: T, statues: StatusCode) -> Response {
    // log::debug!("user is empty!");
    let mut resp =
        warp::reply::with_header(reply, "Access-Control-Allow-Origin", "*").into_response();
    resp.headers_mut()
        .append("Connection", "Keep-Alive".parse().unwrap());
    resp.headers_mut()
        .append("Keep-Alive", "timeout=2, max=100".parse().unwrap());
    *resp.status_mut() = statues;
    resp
}
