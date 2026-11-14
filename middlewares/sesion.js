const usuarioModel = require('../models/usuarioModel');
const { rechazar } = require('../controllers/respuesta');
const objUsuarioModel = new usuarioModel();

// La respuesta lleva SinSesion para que la aplicación de React muestre la pantalla de ingreso
function sinSesion(res) {
    res.type('json');
    res.send({ "Success": false, "SinSesion": true, "Mensaje": 'Su sesión terminó. Vuelva a ingresar' });
}

// Deja pasar solo a quien ingresó y sigue activo. Los datos del usuario quedan en req.usuario,
// leídos de la base en cada petición: si lo desactivan o le cambian el rol, se aplica de inmediato.
async function requiereSesion(req, res, next) {
    if (!req.session.id_usuario) {
        return sinSesion(res);
    }
    let usuario = await objUsuarioModel.ObtenerActivo(req.session.id_usuario);
    if (!usuario) {
        return req.session.destroy(() => sinSesion(res));
    }
    req.usuario = usuario;
    next();
}

// Va después de requiereSesion, en las rutas de configuración y usuarios
function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return rechazar(res, 'Solo un administrador puede realizar esta acción');
    }
    next();
}

// Abre la sesión del usuario. regenerate descarta la sesión anterior del navegador,
// así nadie puede dejar preparada una sesión para que otro ingrese en ella.
function abrirSesion(req, usuario) {
    return new Promise(function (resolve, reject) {
        req.session.regenerate(function (error) {
            if (error) {
                return reject(error);
            }
            req.session.id_usuario = usuario.id_usuario;
            resolve(usuario);
        });
    });
}

function cerrarSesion(req) {
    return new Promise(function (resolve, reject) {
        req.session.destroy((error) => error ? reject(error) : resolve());
    });
}

module.exports = { requiereSesion, soloAdmin, abrirSesion, cerrarSesion };
