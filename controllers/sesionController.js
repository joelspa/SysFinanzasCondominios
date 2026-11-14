const { autenticar, cambiarContrasena } = require('../services/autenticacion');
const { abrirSesion, cerrarSesion } = require('../middlewares/sesion');
const { MINIMO } = require('../utils/contrasena');
const { responder, rechazar } = require('./respuesta');

module.exports = {
    iniciarSesion: (req, res) => {
        let correo = String(req.body.correo || '').trim();
        let contrasena = String(req.body.contrasena || '');
        if (correo === '' || contrasena === '') {
            return rechazar(res, 'Escriba su correo y su contraseña');
        }
        responder(res, autenticar(correo, contrasena).then((usuario) => abrirSesion(req, usuario)));
    },
    cerrarSesion: (req, res) => {
        responder(res, cerrarSesion(req));
    },
    // Usuario que tiene la sesión abierta, sus condominios y en cuál está trabajando
    // (requiereSesion ya dejó todo en la petición)
    obtenerSesion: (req, res) => {
        responder(res, Promise.resolve({ ...req.usuario, condominios: req.condominios, id_condominio: req.idCondominio }));
    },
    cambiarContrasena: (req, res) => {
        let actual = String(req.body.actual || '');
        let nueva = String(req.body.nueva || '');
        if (nueva.length < MINIMO) {
            return rechazar(res, 'La contraseña nueva debe tener al menos ' + MINIMO + ' caracteres');
        }
        responder(res, cambiarContrasena(req.usuario, actual, nueva));
    }
};
