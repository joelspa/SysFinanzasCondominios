// Crea un administrador o, si el correo ya existe, le cambia la contraseña y lo deja como administrador activo.
// Sirve para dar la primera contraseña (el usuario inicial de schema.sql no tiene) o para recuperar el acceso.
// Uso: npm run admin -- correo@ejemplo.com SuContraseña
const fs = require('fs');
const path = require('path');

const archivoEnv = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(archivoEnv)) {
    process.loadEnvFile(archivoEnv);
}
const db = require('../config/db');
const { cifrar, MINIMO } = require('../utils/contrasena');

const [correo, contrasena] = process.argv.slice(2);
if (!correo || !contrasena || contrasena.length < MINIMO) {
    console.error('Indique el correo y una contraseña de al menos ' + MINIMO + ' caracteres.');
    console.error('Ejemplo: npm run admin -- admin@condominio.com SuContraseña');
    process.exit(1);
}

const sql = "INSERT INTO usuario (nombre, correo, password_hash, rol, activo) VALUES ('Administrador', $1, $2, 'admin', TRUE) "
    + "ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = 'admin', activo = TRUE";

cifrar(contrasena)
    .then((huella) => db.none(sql, [correo, huella]))
    .then(() => console.log('Listo: ' + correo + ' puede ingresar como administrador'))
    .catch((error) => {
        console.error('No se guardó. Error: ' + error.message);
        process.exitCode = 1;
    })
    .finally(() => db.$pool.end());
