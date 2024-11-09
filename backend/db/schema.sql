CREATE TABLE model (
    id INTEGER PRIMARY KEY  ,
    title VARCHAR NOT NULL,
    fileData BLOB NOT NULL
);

CREATE TABLE metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INT NOT NULL,
    product_id VARCHAR
);