use crate::cargo::{CargoRespond, VerifyReq};
use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use sqlx::PgPool;
//use sqlx::postgres::PgPool;
//use chrono::{DateTime, TimeZone, NaiveDateTime, Utc};

#[get("/cargos")]
async fn find_all(db_pool: web::Data<PgPool>) -> impl Responder {
    println!("\n find_all route create \n");
    let result = CargoRespond::find_all(db_pool.get_ref()).await;
    match result {
        Ok(cargos) => HttpResponse::Ok().json(cargos),
        _ => HttpResponse::BadRequest().body("Error trying to read all cargos from database\n")
    }
}



#[post("/verify")]
async fn verify(verify_req: web::Json<VerifyReq>, db_pool: web::Data<PgPool>) -> impl Responder {
    // verify parameters （in hashs tables）: cid and hashcode 
    println!("\n verify IHash route create \n");
    let result = CargoRespond::verify(verify_req.into_inner(), db_pool.get_ref()).await;
    match result {
        Ok(hashs) => HttpResponse::Ok().json(hashs),
        Err(error) =>HttpResponse::BadRequest().body(format!("Error :{} \n", error))
       // _ => HttpResponse::BadRequest().body("Failed to Verify data..... XXX! \n")
    }
}


#[get("/cargo/{id}")]
async fn find(id: web::Path<i64>, db_pool: web::Data<PgPool>) -> impl Responder {
    let result = CargoRespond::find_by_id(id.into_inner(), db_pool.get_ref()).await;
    match result {
        Ok(cargo) => { 
            HttpResponse::Ok().json(cargo)
        }
        _ => HttpResponse::BadRequest().body("Cargo not found \n")
    }
}




#[post("/cargo")]
async fn create(cargo: web::Json<CargoRespond>, db_pool: web::Data<PgPool>) -> impl Responder {
     
    let result = CargoRespond::create(cargo.into_inner(), db_pool.get_ref()).await;
    match result {
        Ok(cid) => {
             HttpResponse::Ok().body(format!("Successfully inserted , the record cid is {} \n", cid))
        },
        Err(error) => {
            HttpResponse::BadRequest().body(format!("Fail inserted :{} \n", error))
        }
    } 
}


#[put("/cargo")]
async fn update(cargo: web::Json<CargoRespond>, db_pool: web::Data<PgPool>) -> impl Responder {
    
    println!("\n Update route create \n");

    let result = CargoRespond::update(cargo.into_inner(),db_pool.get_ref()).await;
    match result {
        Ok(rows) => {
            if rows > 0 {
                HttpResponse::Ok().body(format!("Successfully update {} record(s) \n", rows))
            } else {
                HttpResponse::BadRequest().body("!!!Fail update 0 rows! \n")
            }
        },
        Err(error) => {
            HttpResponse::BadRequest().body(format!("Fail update :{} \n", error))
        }
    }
}

#[delete("/cargo/{id}")]
async fn delete(id: web::Path<i64>, db_pool: web::Data<PgPool>) -> impl Responder {
    let result = CargoRespond::delete(id.into_inner(), db_pool.get_ref()).await;
    match result {
        Ok(rows) => {
            if rows > 0 {
                HttpResponse::Ok().body(format!("Successfully deleted {} record(s) \n", rows))
            } else {
                HttpResponse::BadRequest().body("Cargo not found \n")
            }
        },
        _ => HttpResponse::BadRequest().body("Cargo not found \n")
    }
}


// function that will be called on new Application to configure routes for this module
pub fn init(cfg: &mut web::ServiceConfig) {
    cfg.service(find_all);
    cfg.service(find);
    cfg.service(create);
    cfg.service(update);
    cfg.service(delete);
    cfg.service(verify);
}