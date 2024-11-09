CREATE TABLE model (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    fileData BLOB NOT NULL
)

CREATE TABLE metadata (
    id SERIAL PRIMARY KEY,
    model_id INT NOT NULL,
    product_id VARCHAR
)