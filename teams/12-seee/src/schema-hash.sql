CREATE TABLE IF NOT EXISTS hashs (        
    id          serial PRIMARY KEY,        
    cid         text NOT NULL REFERENCES cargo(cid) ON DELETE CASCADE,       
    account     text NOT NULL,
    mkroot      text NOT NULL,    -- should be u64 in rust type
    hashcode    text NOT NULL,
    hashcodeu64  text  NOT NULL,    -- should be u64 in rust type
    proofarr     text[]   NOT NULL ,   -- should be u64[] in rust type
    proofindex   INT[]  NOT NULL             
);

