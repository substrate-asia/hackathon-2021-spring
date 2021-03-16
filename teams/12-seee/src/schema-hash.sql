CREATE TABLE IF NOT EXISTS hashs (        
    id          serial PRIMARY KEY,        
    cid         text NOT NULL REFERENCES cargo(cid) ON DELETE CASCADE,       
    account     text NOT NULL,
    mkroot      text NOT NULL,   
    hashcode    text NOT NULL,
    hashcodeu64  text  NOT NULL,   
    proofarr     text[]   NOT NULL , 
    proofindex   INT[]  NOT NULL             
);

