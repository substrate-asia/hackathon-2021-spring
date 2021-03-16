CREATE TABLE IF NOT EXISTS cargo (   -- 上传的打包hashs数据包， 简称cargo
    id          BIGSERIAL NOT NULL PRIMARY KEY,  --自增ID    
    cid         text NOT NULL UNIQUE,  -- cargo ID ， 由 mktree + timestamp = $1 字段做sha256运算而来 ->  digest($1, 'sha256')      
    account     text NOT NULL,         -- user account
    timestamp   INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),   
    mkarr       text[] NOT NULL,          -- merkle tree with string array string 
    mkroot      text NOT NULL DEFAULT '0',   -- merkle root
    blocknum    text NOT NULL DEFAULT '0',    -- blockchain return block-hash 
    done        boolean NOT NULL DEFAULT FALSE    -- lable if block-hash returned and complete writing hash table 
);

/*

-- First  enable PostgreSQL pgcrypto Extention:
create extension pgcrypto;
digest($1, 'sha256')
*/



