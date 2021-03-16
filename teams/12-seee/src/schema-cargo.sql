CREATE TABLE IF NOT EXISTS cargo (   
    id          BIGSERIAL NOT NULL PRIMARY KEY,  
    cid         text NOT NULL UNIQUE,    
    account     text NOT NULL,
    timestamp   INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()), 
    mkarr       text[] NOT NULL, 
    mkroot      text NOT NULL DEFAULT '0',   
    blocknum    text NOT NULL DEFAULT '0', 
    done        boolean NOT NULL DEFAULT FALSE 
);



