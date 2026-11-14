const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

// Contraseñas de los usuarios: nunca se guardan en texto, solo su huella (scrypt con sal aleatoria).
// Se guarda en usuario.password_hash con el formato: scrypt$<sal>$<huella> (en hexadecimal).
// verificar() es la que debe usar el inicio de sesión para comparar lo que escribe el usuario.

const LARGO = 64;
const MINIMO = 8;   // largo mínimo de una contraseña

async function cifrar(contrasena) {
    let sal = crypto.randomBytes(16).toString('hex');
    let huella = await scrypt(contrasena, sal, LARGO);
    return 'scrypt$' + sal + '$' + huella.toString('hex');
}

async function verificar(contrasena, guardada) {
    let [algoritmo, sal, huella] = String(guardada || '').split('$');
    if (algoritmo !== 'scrypt' || !sal || !huella) {
        return false;
    }
    let calculada = await scrypt(String(contrasena), sal, LARGO);
    let esperada = Buffer.from(huella, 'hex');
    return esperada.length === calculada.length && crypto.timingSafeEqual(calculada, esperada);
}

module.exports = { cifrar, verificar, MINIMO };
