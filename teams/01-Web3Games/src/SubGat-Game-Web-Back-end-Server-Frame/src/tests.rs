use rbatis::crud::CRUD;
use warp::http::StatusCode;
use warp::test::request;

use super::{
    db::{self, Register, RegistersDB},
    filters,
};

#[tokio::test]
async fn test_post_faild() {
    let db = db::init_rbatis().await;
    let api = filters::main_logic(db.clone());
    // let _ret = handlers::delete_user(1, db.clone()).await;
    let _delete_id = db.remove_by_id::<RegistersDB>("", &1).await;
    // println!("ret = {:?}", _delete_id);
    let resp = request()
        .method("POST")
        .path("/register")
        .json(&Register {
            id: 1,
            uuid: "232324428848".into(),
            phone_number: "17366503261".into(),
            password: "123456".into(),
            web3_address: "12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1iZU".into(),
            sign_time: "2020-1-1".into(),
            login_time: "2020-1-2".into(),
        })
        .reply(&api)
        .await;

    assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_post_conflict() {
    let db = db::init_rbatis().await;

    let create_register_db = RegistersDB::from(register1());
    let _r = db.save("", &create_register_db).await;
    let api = filters::main_logic(db.clone());

    let resp = request()
        .method("POST")
        .path("/register")
        .json(&register1())
        .reply(&api)
        .await;

    assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_update_phone_number() {
    let _ = pretty_env_logger::try_init();
    let db = db::init_rbatis().await;
    let api = filters::main_logic(db.clone());

    let resp = request()
        .method("PUT")
        .path("/user/phonenumber/1")
        .header("authorization", "Bearer admin")
        .json(&Register {
            id: 1,
            uuid: "232324428848".into(),
            phone_number: "1025185920".into(),
            password: "123456".into(),
            web3_address: "12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXedavirain".into(),
            sign_time: "2020-1-1".into(),
            login_time: "2020-1-2".into(),
        })
        .reply(&api)
        .await;

    assert_eq!(resp.status(), StatusCode::OK);
}
#[tokio::test]
async fn test_update_web3address() {
    let _ = pretty_env_logger::try_init();
    let db = db::init_rbatis().await;
    let api = filters::main_logic(db.clone());

    let resp = request()
        .method("PUT")
        .path("/user/web3address/1")
        .header("authorization", "Bearer admin")
        .json(&Register {
            id: 1,
            uuid: "232324428848".into(),
            phone_number: "17366503261".into(),
            password: "654321".into(),
            web3_address: "12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1iZU".into(),
            sign_time: "2020-1-1".into(),
            login_time: "2020-1-2".into(),
        })
        .reply(&api)
        .await;

    assert_eq!(resp.status(), StatusCode::OK);
}
#[tokio::test]
async fn test_update_password() {
    let _ = pretty_env_logger::try_init();
    let db = db::init_rbatis().await;
    let api = filters::main_logic(db.clone());

    let resp = request()
        .method("PUT")
        .path("/user/password/1")
        .header("authorization", "Bearer admin")
        .json(&Register {
            id: 1,
            uuid: "232324428848".into(),
            phone_number: "17366503261".into(),
            password: "123456".into(),
            web3_address: "12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1iZU".into(),
            sign_time: "2020-1-1".into(),
            login_time: "2020-1-2".into(),
        })
        .reply(&api)
        .await;

    assert_eq!(resp.status(), StatusCode::OK);
}

fn register1() -> Register {
    Register {
        id: 1,
        uuid: "239934993493".into(),
        phone_number: "17366503261".into(),
        password: "123456".into(),
        web3_address: "12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1iZU".into(),
        sign_time: "2020-1-1".into(),
        login_time: "2020-1-2".into(),
    }
}
