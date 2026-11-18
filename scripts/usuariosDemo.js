// Deja listos los usuarios de prueba del README, con contraseñas conocidas:
//   admin@condominio.com     / Admin2026      (administrador: ve todos los condominios)
//   tesorero@condominio.com  / Tesorero2026   (tesorero: solo el primer condominio)
// Si ya existían, les vuelve a poner esas contraseñas y los deja activos.
// Es solo para probar el sistema: en un uso real cree los usuarios desde la pantalla Usuarios.
// Uso: npm run demo
const fs = require('fs');
const path = require('path');

const archivoEnv = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(archivoEnv)) {
    process.loadEnvFile(archivoEnv);
}
const db = require('../config/db');
const { cifrar } = require('../utils/contrasena');

const USUARIOS = [
    { nombre: 'Administrador', correo: 'admin@condominio.com', contrasena: 'Admin2026', rol: 'admin' },
    { nombre: 'Tesorero de prueba', correo: 'tesorero@condominio.com', contrasena: 'Tesorero2026', rol: 'tesorero' }
];

const SQL_USUARIO = 'INSERT INTO usuario (nombre, correo, password_hash, rol, activo) VALUES ($1, $2, $3, $4, TRUE) '
    + 'ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol, activo = TRUE '
    + 'RETURNING id_usuario';

// El tesorero ve solo el primer condominio (el administrador ve todos y no necesita asignación)
const SQL_ASIGNAR = 'INSERT INTO usuario_condominio (id_usuario, id_condominio) '
    + 'SELECT $1, MIN(id_condominio) FROM condominio ON CONFLICT DO NOTHING';

async function crear() {
    let huellas = await Promise.all(USUARIOS.map((u) => cifrar(u.contrasena)));
    await db.tx(async function (t) {
        for (let i = 0; i < USUARIOS.length; i++) {
            let u = USUARIOS[i];
            let { id_usuario } = await t.one(SQL_USUARIO, [u.nombre, u.correo, huellas[i], u.rol]);
            if (u.rol === 'tesorero') {
                await t.none(SQL_ASIGNAR, [id_usuario]);
            }
        }
    });
    console.log('Usuarios de prueba listos:');
    USUARIOS.forEach((u) => console.log('  ' + u.correo.padEnd(26) + u.contrasena.padEnd(15) + u.rol));
}

crear()
    .catch((error) => {
        console.error('No se crearon los usuarios. Error: ' + error.message);
        process.exitCode = 1;
    })
    .finally(() => db.$pool.end());
