const pgp = require('pg-promise')();

const db = pgp({
    "host": "localhost",
    "port": 5432,
    "database": "desaweb2",
    "user": "postgres",
    "password": "P@ssw0rd",
    "connectionTimeoutMillis": 5000
});

module.exports = db;
