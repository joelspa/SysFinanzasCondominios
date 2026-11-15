const cajaModel = require('../models/cajaModel');
const { SENTIDOS } = require('../services/caja');
const { responder, rechazar, leerCampos, leerMotivo, esFechaFutura } = require('./respuesta');
const objCajaModel = new cajaModel();

const CAMPOS = ['sentido', 'monto', 'fecha', 'observacion'];

module.exports = {
    obtenerCaja: (req, res) => {
        responder(res, objCajaModel.ObtenerCaja(req.idCondominio));
    },
    guardarMovimiento: (req, res) => {
        let data = { ...leerCampos(req.body, CAMPOS), id_usuario: req.usuario.id_usuario };
        if (!SENTIDOS.includes(data.sentido)) {
            return rechazar(res, 'Indique si es un depósito al banco o un retiro del banco');
        }
        if (!(Number(data.monto) > 0)) {
            return rechazar(res, 'Escriba el monto que se movió');
        }
        if (!data.fecha) {
            return rechazar(res, 'Indique la fecha del movimiento');
        }
        if (esFechaFutura(data.fecha)) {
            return rechazar(res, 'La fecha del movimiento no puede ser posterior a hoy');
        }
        responder(res, objCajaModel.GuardarMovimiento(req.idCondominio, data).then((nuevo) => nuevo.id_movimiento_caja));
    },
    anularMovimiento: (req, res) => {
        let motivo = leerMotivo(req.body);
        if (motivo === '') {
            return rechazar(res, 'Indique el motivo de la anulación');
        }
        let data = { id_movimiento_caja: req.body.id_movimiento_caja, motivo, id_usuario: req.usuario.id_usuario };
        responder(res, objCajaModel.AnularMovimiento(req.idCondominio, data));
    }
};
