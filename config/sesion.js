// Sesiones de los usuarios (express-session). Se guardan en PostgreSQL, en la tabla sesion,
// para que nadie tenga que volver a ingresar cuando se reinicia el servidor.
const session = require('express-session');
const AlmacenPg = require('connect-pg-simple')(session);
const db = require('./db');

if (!process.env.SESSION_SECRET) {
    throw new Error('Falta SESSION_SECRET en .env.local (ver .env.example)');
}

const OCHO_HORAS = 8 * 60 * 60 * 1000;

module.exports = session({
    name: 'condominios.sid',
    secret: process.env.SESSION_SECRET,           // firma la cookie para que no se pueda falsificar
    store: new AlmacenPg({ pgPromise: db, schemaName: 'final', tableName: 'sesion' }),
    resave: false,
    saveUninitialized: false,                     // no crea sesiones para quien no ha ingresado
    rolling: true,                                // cada uso renueva las ocho horas
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: OCHO_HORAS }
});
