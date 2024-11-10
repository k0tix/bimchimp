CREATE TABLE model (
    id INTEGER PRIMARY KEY  ,
    title VARCHAR NOT NULL,
    fileData BLOB NOT NULL
);

CREATE TABLE metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    element_id INT NOT NULL,
    model_id INT NOT NULL,
    clash_type VARCHAR,
    product_id VARCHAR
);