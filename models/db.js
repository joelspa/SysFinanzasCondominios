// schema: todas las consultas usan las tablas del esquema final
const pgp = require('pg-promise')({ schema: 'final' });

// Conexión a PostgreSQL, los datos vienen de .env.local
const db = pgp({
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "database": process.env.DB_NAME,
    "user": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "connectionTimeoutMillis": 5000
});

module.exports = db;
