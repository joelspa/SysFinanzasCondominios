const usuarioModel = require('../models/usuarioModel');
const condominioModel = require('../models/condominioModel');
const { rechazar } = require('../controllers/respuesta');
const objUsuarioModel = new usuarioModel();
const objCondominioModel = new condominioModel();

// La respuesta lleva SinSesion para que la aplicación de React muestre la pantalla de ingreso
function sinSesion(res) {
    res.type('json');
    res.send({ "Success": false, "SinSesion": true, "Mensaje": 'Su sesión terminó. Vuelva a ingresar' });
}

// Condominio en el que está trabajando el usuario: el que eligió, si todavía puede usarlo;
// si no (recién ingresó, o le quitaron ese condominio), el primero de los suyos
function condominioActivo(sesion, condominios) {
    let puedeUsarlo = condominios.some((c) => c.id_condominio === sesion.id_condominio);
    if (!puedeUsarlo) {
        sesion.id_condominio = condominios[0].id_condominio;
    }
    return sesion.id_condominio;
}

// Deja pasar solo a quien ingresó, sigue activo y tiene al menos un condominio. Deja en la petición:
//   req.usuario       datos del usuario
//   req.condominios   condominios que puede usar [{ id_condominio, nombre }]
//   req.idCondominio  condominio en el que está trabajando (los modelos lo reciben como parámetro)
// Todo se lee de la base en cada petición: si lo desactivan, le cambian el rol o le quitan
// un condominio, se aplica de inmediato.
async function requiereSesion(req, res, next) {
    if (!req.session.id_usuario) {
        return sinSesion(res);
    }
    let usuario = await objUsuarioModel.ObtenerActivo(req.session.id_usuario);
    let condominios = usuario ? await objCondominioModel.ObtenerPermitidos(usuario) : [];
    if (condominios.length === 0) {
        return req.session.destroy(() => sinSesion(res));
    }
    req.usuario = usuario;
    req.condominios = condominios;
    req.idCondominio = condominioActivo(req.session, condominios);
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
