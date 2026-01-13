const pgp = require("pg-promise")();

const connectionConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
}

const db = pgp(connectionConfig);

// Test connection
db.connect()
    .then(o => {
        console.log("Database successfully connected!");
        o.done()
    })
    .catch(err => {
        console.log("Error occured: ", err.message || err);
    })


// Create 'hello' table if not exists (for testing)
db.result(`
    CREATE TABLE IF NOT EXISTS hello (
        id      INT             PRIMARY KEY     GENERATED ALWAYS AS IDENTITY,
        name    VARCHAR(100)    NOT NULL
    );
`)
    .then(o => {
        console.log("Table hello created!")
    })
    .catch(err => console.log("Error occured when creating hello table: ", err.message || err));


module.exports = db;