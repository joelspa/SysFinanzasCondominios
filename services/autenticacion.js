const usuarioModel = require('../models/usuarioModel');
const condominioModel = require('../models/condominioModel');
const { verificar } = require('../utils/contrasena');
const objUsuarioModel = new usuarioModel();
const objCondominioModel = new condominioModel();

// Reglas del inicio de sesión y del cambio de contraseña.

// Comprueba el correo y la contraseña. Devuelve los datos del usuario (sin la huella de la contraseña).
// El mensaje es el mismo si falla el correo o la contraseña: no revela qué correos existen.
async function autenticar(correo, contrasena) {
    let usuario = await objUsuarioModel.ObtenerPorCorreo(correo);
    let coincide = usuario ? await verificar(contrasena, usuario.password_hash) : false;
    if (!coincide) {
        throw new Error('El correo o la contraseña no son correctos');
    }
    if (!usuario.activo) {
        throw new Error('Su usuario está desactivado. Consulte con un administrador');
    }
    // Un tesorero sin condominios asignados no tendría nada que ver
    let condominios = await objCondominioModel.ObtenerPermitidos(usuario);
    if (condominios.length === 0) {
        throw new Error('Su usuario no tiene ningún condominio asignado. Consulte con un administrador');
    }
    return { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol };
}

// Cada usuario cambia su propia contraseña: tiene que escribir la actual
async function cambiarContrasena(usuario, actual, nueva) {
    let guardado = await objUsuarioModel.ObtenerPorCorreo(usuario.correo);
    if (!await verificar(actual, guardado.password_hash)) {
        throw new Error('La contraseña actual no es correcta');
    }
    await objUsuarioModel.CambiarContrasena(usuario.id_usuario, nueva);
}

module.exports = { autenticar, cambiarContrasena };
