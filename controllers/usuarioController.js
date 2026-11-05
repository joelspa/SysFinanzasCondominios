const usuarioModel = require('../models/usuarioModel');
const { MINIMO } = require('../models/contrasena');
const { responder, rechazar, leerCampos } = require('./respuesta');
const objUsuarioModel = new usuarioModel();

const CAMPOS = ['nombre', 'correo', 'rol', 'activo'];
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = {
    obtenerUsuarios: (req, res) => {
        responder(res, objUsuarioModel.ObtenerUsuarios());
    },
    guardarUsuario: (req, res) => {
        let data = { id_usuario: req.body.id_usuario, ...leerCampos(req.body, CAMPOS), contrasena: req.body.contrasena || '' };
        let esNuevo = data.id_usuario == 0;
        if (data.correo && !CORREO.test(data.correo)) {
            return rechazar(res, 'El correo electrónico no es válido');
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
}
