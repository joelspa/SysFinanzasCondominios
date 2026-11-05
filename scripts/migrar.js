// Ejecuta un archivo SQL sobre la base de datos de .env.local en una sola transacción:
// si algo falla no se aplica ningún cambio.
// Uso: npm run migrar -- database/migracion_fase1.sql
const fs = require('fs');
const path = require('path');

const archivoEnv = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(archivoEnv)) {
    process.loadEnvFile(archivoEnv);
}
const db = require('../models/db');

const archivo = process.argv[2];
if (!archivo) {
    console.error('Indique el archivo SQL. Ejemplo: npm run migrar -- database/migracion_fase1.sql');
    process.exit(1);
}

const sql = fs.readFileSync(path.resolve(archivo), 'utf8');

db.tx((t) => t.none(sql))
    .then(() => console.log('Migración aplicada: ' + archivo))
    .catch((error) => {
        console.error('No se aplicó ningún cambio. Error: ' + error.message);
        process.exitCode = 1;
    })
    .finally(() => db.$pool.end());
