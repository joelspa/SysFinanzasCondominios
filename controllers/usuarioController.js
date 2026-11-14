const usuarioModel = require('../models/usuarioModel');
const { MINIMO } = require('../utils/contrasena');
const { responder, rechazar, leerCampos } = require('./respuesta');
const objUsuarioModel = new usuarioModel();

const CAMPOS = ['nombre', 'correo', 'rol', 'activo'];
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Ids de los condominios marcados en el formulario (lista vacía si no vino ninguno)
function leerCondominios(body) {
    let lista = Array.isArray(body.condominios) ? body.condominios : [];
    return lista.map(Number).filter(Number.isInteger);
}

module.exports = {
    obtenerUsuarios: (req, res) => {
        responder(res, objUsuarioModel.ObtenerUsuarios());
    },
    guardarUsuario: (req, res) => {
        let data = {
            id_usuario: req.body.id_usuario, ...leerCampos(req.body, CAMPOS), contrasena: req.body.contrasena || '',
            condominios: leerCondominios(req.body)
        };
        let esNuevo = data.id_usuario == 0;
        if (data.correo && !CORREO.test(data.correo)) {
            return rechazar(res, 'El correo electrónico no es válido');
        }
        // El administrador ve todos los condominios; al tesorero hay que decirle cuáles
        if (data.rol === 'tesorero' && data.condominios.length === 0) {
            return rechazar(res, 'Seleccione al menos un condominio para el tesorero');
        }
        // Al crear la contraseña es obligatoria; al editar, vacía significa "no cambiarla"
        if ((esNuevo || data.contrasena !== '') && data.contrasena.length < MINIMO) {
            return rechazar(res, 'La contraseña debe tener al menos ' + MINIMO + ' caracteres');
        }
        if (esNuevo) {
            responder(res, objUsuarioModel.GuardarUsuario(data).then((nuevo) => nuevo.id_usuario));
        } else {
            responder(res, objUsuarioModel.ActualizarUsuario(data));
        }
    },
    eliminarUsuario: (req, res) => {
        responder(res, objUsuarioModel.EliminarUsuario({ id_usuario: req.body.id_usuario }));
    }
};
