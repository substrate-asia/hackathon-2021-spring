use serde::{Serialize, Deserialize};
use actix_web::{HttpResponse, HttpRequest, Responder, Error};
use futures::future::{ready, Ready};
use sqlx::{FromRow};
//use sqlx::postgres::PgPool;
use sqlx::PgPool;
//use sqlx::postgres::PgRow;
//use sqlx::postgres::PgDatabaseError;
use anyhow::{Result, anyhow};
//use log::info;
use chrono::{DateTime, Utc};
//use chrono::{NaiveDate, NaiveDateTime};

use merkle_cbt::{merkle_tree::Merge, CBMT as ExCBMT, MerkleProof};
use std::collections::hash_map::DefaultHasher;
use std::hash::Hasher;

use sha2::{Sha256, Digest};

// use substrate_api_client::{Api, node_metadata};
// https://github.com/scs/substrate-api-client/tree/master/tutorials
// https://substrate.dev/docs/en/tutorials/build-a-dapp/prepare



pub struct DefaultHasherU64;

impl Merge for DefaultHasherU64 {
    type Item = u64;
    fn merge(left: &Self::Item, right: &Self::Item) -> Self::Item {
        let mut hasher = DefaultHasher::new();
        hasher.write_u64(*left);
        hasher.write_u64(*right);
        hasher.finish()
    }
}

type CBMT = ExCBMT<u64, DefaultHasherU64>;
type CBMTProof = MerkleProof<u64, DefaultHasherU64>;

// this struct will use to represent cargo database record
#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct CargoRespond {
    #[serde(default = "default_id")]
    pub id: i64,
    #[serde(default = "default_cid")]
    pub cid: String,
    pub account: String,
    #[serde(default = "default_timestamp")]
    pub timestamp: i32,
    pub mkarr: Vec<String>,
    #[serde(default = "default_mkroot")]
    pub mkroot: String,
    #[serde(default = "default_blocknum")]
    pub blocknum: String,
    #[serde(default = "default_done")]
    pub done: bool
}

//BEGIN-----Deserialize Default Value for CargoRespond------

fn default_id() -> i64 {
    -1
}

fn default_cid() -> String {
    "0".to_string()
}

fn default_timestamp() -> i32 {
    0
}

fn default_mkroot() -> String {
    "0".to_string()
}

fn default_blocknum() -> String {
    "0".to_string()
}

fn default_done() -> bool {
   false
}



// this struct will be used to represent hashs database record
#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct IHash {
    pub id: i64,
    #[serde(default = "default_hash_cid")]
    pub cid: String,
    #[serde(default = "default_hash_account")]
    pub account: String,
    #[serde(default = "default_hash_mkroot")]
    pub mkroot: String,   
    #[serde(default = "default_hash_hashcode")]
    pub hashcode: String,     //  输入的 string 字符串数组项
    #[serde(default = "default_hash_hashcodeu64")]
    pub hashcodeu64: String,     //  CBMT 的内部 defaulthasher 实现的 u64 数组项
    #[serde(default = "default_hash_proofarr")]
    pub proofarr: Vec<String>,  //  proof lemmas  array   （证据节点路径数据）
    #[serde(default = "default_hash_proofindex")]
    pub proofindex: Vec<i32>,  //  proof index （证据叶子节点的索引数- 数组形式, 这里的index是 全二叉树索引cbt）
    #[serde(default = "default_hash_timestamp")]
    pub timestamp: i32, 
    #[serde(default = "default_hash_mkarr")]
    pub mkarr: Vec<String>, 
    #[serde(default = "default_hash_blocknum")]
    pub blocknum: String,
    #[serde(default = "default_hash_bool")]
    pub done: bool 
}

//BEGIN-----Deserialize Default Value for CargoRespond------

fn default_hash_cid() -> String {
    "0".to_string()
}

fn default_hash_account() -> String {
    "0".to_string()
}

fn default_hash_mkroot() -> String {
    "0".to_string()
}

fn default_hash_hashcode() -> String {
    "0".to_string()
}

fn default_hash_hashcodeu64() -> String {
    "0".to_string()
}

fn default_hash_proofarr() -> Vec<String> {
    vec!["0".to_string()]
}

fn default_hash_proofindex() -> Vec<i32>  {
    vec![0]
}

fn default_hash_timestamp() -> i32 {
    0
}

fn default_hash_mkarr() -> Vec<String> {
    vec!["0".to_string()]
}

fn default_hash_blocknum() -> String {
    "0".to_string()
}

fn default_hash_bool() -> bool {
    false
 }
//END---------------------------------------------------




#[derive(Deserialize,Serialize, Debug)]
pub struct VerifyReq {
   pub cid: String,
   pub hashcode: String
}


// implementation of Actix Responder for CargoRespond struct so we can return CargoRespond from action handler
impl Responder for CargoRespond {
    type Error = Error;
    type Future = Ready<Result<HttpResponse, Error>>;

    fn respond_to(self, _req: &HttpRequest) -> Self::Future {
        let body = serde_json::to_string(&self).unwrap();
        // create response and set content type
        ready(Ok(
            HttpResponse::Ok()
                .content_type("application/json")
                .body(body)
        ))
    }
}


// Implementation for CargoRespond struct, functions for read/write/update and delete cargo from database
impl CargoRespond {

    pub async fn create(cargo: CargoRespond, pool: &PgPool) ->  Result<String>   {
    
        let mkarr = serde_json::to_string(&cargo.mkarr)?;
        let now: DateTime<Utc> = Utc::now();
        let _timestr = now.timestamp().to_string();
        let cidstr:String = format!("{}{}",&mkarr, &cargo.account ); 

        // create a Sha256 object
        let mut hasher256 = Sha256::new();
        // write input message
        hasher256.update( cidstr.as_bytes() );
        // read hash digest and consume hasher
        let s = format!("{:X}", hasher256.finalize());
        let cidhash = s.to_ascii_lowercase();
        let cid= format!("{}",cidhash);  // copy and return Ok(cid)

        let  result = sqlx::query!( 
            r#"
                INSERT INTO cargo (cid, account, mkarr) VALUES ($1, $2, $3 ) 
            "#,
            // (encode(sha256(key_code), 'hex'))   //encode() 结果中没有\x
            &cidhash, 
            &cargo.account,
            &cargo.mkarr,
            )
            .execute(pool)
            .await;

        match result {
            Ok(result) => {
                println!("Insert {} rows ok!", result.rows_affected());
                let _done = CargoRespond::createhash(cidhash, cargo.account, &cargo.mkarr, pool).await?;
                Ok( cid )
            },
            Err(error) => {
               println!("Insert error: {}", error);
               Err( anyhow!("Insert error: {}", error) )
               /*
                Sqlx error test:
                https://github.com/launchbadge/sqlx/blob/master/tests/postgres/postgres.rs
               */
            }
        }
    }


    pub async fn createhash(cidhash: String, account: String , mkarr: &Vec<String> , pool: &PgPool) ->  Result<()>   {
        // 转换 mkarr<String> 节点数组 到 leaves<u64>  (defaulthaseru64)
        let leaves: Vec<_> =  mkarr.iter().map(|x| { 
            let mut hasher = DefaultHasher::new();
            hasher.write(x.as_bytes());
            hasher.finish()
        }).collect();
        //println!("leaves convert from string: {:#?} => \n u64 : {:#?} ", mkarr, leaves );

        // 计算 mkroot
        let mkroot_u64 = CBMT::build_merkle_root(&leaves);
        let mkroot = mkroot_u64.to_string();
        println!("merkle root is {}", mkroot);

        //写回 mkroot 到 cargo表
        let _done1 = sqlx::query!(
            r#"
            UPDATE cargo SET mkroot = $1 WHERE cid = $2
            "#,
            &mkroot,
            &cidhash
        )             
        .execute(pool)
        .await?;

        
        for (i, _v) in leaves.iter().enumerate() {
            
            let proof = CBMT::build_merkle_proof(&leaves, &[i as u32]).expect("SubEng build merkle proof failed");
            // println!( "merkle proof[{}] lemmas are {:?}, indices are {:?}", i, proof.lemmas(), proof.indices() );

            let lemmas_u64 =  proof.lemmas() ;
            let mut lemmas_string: Vec<String> = Vec::new();
            for jv in lemmas_u64.iter() { 
                lemmas_string.push( jv.to_string() );
            }

            let _done = sqlx::query("INSERT INTO hashs(cid, account, mkroot, hashcode, hashcodeu64, proofarr, proofindex) VALUES($1,$2,$3,$4,$5,$6,$7)")
                .bind( &cidhash )
                .bind( &account )
                .bind( &mkroot )
                .bind( &mkarr[i] )
                .bind( leaves[i].to_string() )
                .bind( lemmas_string)
                .bind( proof.indices() )
                .execute(pool)
                .await?;
        }
        Ok(())
    }


     pub async fn update(cargo: CargoRespond,  pool: &PgPool) -> Result<u64> {
      //  let mut tx = pool.begin().await.unwrap();


        println!(" \n Update  enter model : {:#?} \n", cargo);

        let result = sqlx::query!(
                 r#"
                 UPDATE cargo SET mkarr = $1, done = $2, account = $3, mkroot = $4, blocknum = $5 WHERE id = $6 
                 "#,
                 &cargo.mkarr, 
                 cargo.done,
                 &cargo.account, 
                 &cargo.mkroot,
                 &cargo.blocknum,
                 &cargo.id
            )             
             .execute(pool)
             .await?;

        let rows = result.rows_affected();

        Ok(rows)
        /*     match rows {
                Ok(gout) => {
                    println!("Update {} rows ok!", gout.rows_affected());
                    Ok(gout.rows_affected())
                },
                Err(error) => {
                   println!("Update error: {}", error);
                   Err( anyhow!("Update error: {}", error) )
                }
            }
        */
     }


     pub async fn delete(id: i64, pool: &PgPool) -> Result<u64> {
         println!(" \n delete model  \n");
         let mut tx = pool.begin().await?;
         let deleted = sqlx::query!( 
             r#"
             DELETE FROM cargo WHERE id = $1 
             "#,
             id
         )
             .execute(&mut tx)
             .await?;
 
         tx.commit().await?;
         let rows = deleted.rows_affected();
         Ok(rows)
     }


    pub async fn find_all(pool: &PgPool) -> Result<Vec<CargoRespond>> {
        println!(" \n find_all model  \n");
        let mut cargos = vec![];
        let recs = sqlx::query!(
            r#"
                SELECT id, cid, account, timestamp, mkarr, mkroot, blocknum, done
                    FROM cargo
                ORDER BY id
            "#
        )
        .fetch_all(pool)
        .await?;

        for rec in recs {
            cargos.push(CargoRespond {
                id: rec.id,
                cid: rec.cid,
                account: rec.account,
                timestamp:   rec.timestamp,
                mkarr:  rec.mkarr,
                mkroot: rec.mkroot, 
                blocknum: rec.blocknum,
                done: rec.done
            });
        }

        Ok(cargos)
    }


    pub async fn verify(vreq: VerifyReq,  pool: &PgPool) -> Result<Vec<IHash>> {
        //  let mut tx = pool.begin().await.unwrap();
          let mut myhashs = vec![];
          let recs = sqlx::query!(
            r#"
                SELECT hashs.*, cargo.timestamp, cargo.mkarr, cargo.blocknum, cargo.done 
                   FROM hashs
                INNER JOIN cargo 
                ON hashs.cid = cargo.cid
                WHERE hashs.cid = $1 AND hashs.hashcode = $2  
                ORDER BY hashs.id;
            "#,
            &vreq.cid,
            &vreq.hashcode
        )
        .fetch_all(pool)
        .await?;

        if recs.is_empty() {
            println!("Verify Input Record Not Found...!!!");
            return Err( anyhow!("Verify Input Record Not Found !!!") );
        }

        for rec in recs {
           // verify item
            // 转换 mkarr<String> 节点数组 到 leaves<u64>  (defaulthaseru64)
            let leaves: Vec<_> =  rec.mkarr.iter().map(|x| { 
                let mut hasher = DefaultHasher::new();
                hasher.write(x.as_bytes());
                hasher.finish()
            }).collect();
            //println!("leaves convert from string: {:#?} => \n u64 : {:#?} ", mkarr, leaves );

            // 计算 mkroot
            let tree = CBMT::build_merkle_tree(&leaves);
            


            let indices_i32 = rec.proofindex.to_vec();
            let lemmas_string =  rec.proofarr.to_vec() ;
            let mut indices: Vec<u32> = Vec::new();
            let mut lemmas: Vec<u64> = Vec::new();
 
            for iy in indices_i32 .iter() { 
                indices.push( *iy as u32 );
            }

            for ix in lemmas_string.iter() { 
                let val_u64 = ix.parse::<u64>().expect("Error: lemmas String convert to u64 error \n");
                lemmas.push( val_u64 );
            }

            // rebuild proof
            let needed_leaves: Vec<u64> = indices
            .iter()
            .map(|i| tree.nodes()[*i as usize].clone())
            .collect();

            let mkroot = rec.mkroot.parse::<u64>().expect("Error: mkroot String convert to U64 error \n");
            let rebuild_proof = CBMTProof::new(indices, lemmas);    // 用 indices + lemmas 重建 proof
            let vok:bool = rebuild_proof.verify(&mkroot, &needed_leaves);    // 用 root 和 indics-leaves 来验证 rproof            

            if vok { 
                println!("-----Verify OK, the result is : {}", vok);
            } else {
                println!("-----Verify Failed, the result is : {}", vok);
                return Err( anyhow!("Verify Failed, the Result is {}", vok) );
            }

            // push item in result
            myhashs.push( IHash {
                id: rec.id as i64,
                cid: rec.cid,
                account: rec.account,
                mkroot: rec.mkroot, 
                hashcode: rec.hashcode,
                hashcodeu64: rec.hashcodeu64,
                proofarr: rec.proofarr,
                proofindex: rec.proofindex,
                timestamp: rec.timestamp,
                mkarr: rec.mkarr,
                blocknum: rec.blocknum,
                done: rec.done
            });
        }
          Ok(myhashs)
    }



    pub async fn find_by_id(id: i64, pool: &PgPool) -> Result<CargoRespond> {
        let rec = sqlx::query!(
                r#"
                    SELECT * FROM cargo WHERE id = $1
                "#,
                id
            )
            .fetch_one(&*pool)
            .await?;

        Ok(CargoRespond {
            id: rec.id,
            cid: rec.cid,
            account: rec.account,
            timestamp:   rec.timestamp,
            mkarr:  rec.mkarr,
            mkroot: rec.mkroot,
            blocknum: rec.blocknum,
            done: rec.done
        })
    }


//================= substrate_api_client ==================
 //  pub async fn onchain(cid: String, mkroot: String, pool: &PgPool) -> Result<u32> { 
 //      Ok(1)
 //  } 

}

/*

impl iHash {

                SELECT * FROM hashs WHERE cid = $1 AND hashcode = $2 
                ORDER BY id
}
*/


