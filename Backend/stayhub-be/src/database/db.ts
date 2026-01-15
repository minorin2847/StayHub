import pgPromise from 'pg-promise'

const pgp = pgPromise();

const connectionString = "postgres://" +
                            process.env.DB_USER + ":" +
                            process.env.DB_PASSWORD + "@" +
                            process.env.DB_HOST + ":" +
                            process.env.DB_PORT + "/" + 
                            process.env.DB_NAME

const db = pgp(connectionString);

// Test connection
db.connect()
    .then(o => {
        console.log("Database successfully connected!");
        o.done()
    })
    .catch(err => {
        console.log("Error occured: ", err.message || err);
    })

export default db;