const egresoModel = require('../models/egresoModel');
const { responder, rechazar, leerCampos, leerMotivo } = require('./respuesta');
const objEgresoModel = new egresoModel();

const CAMPOS = ['id_tipo_egreso', 'concepto', 'proveedor', 'numero_documento', 'monto', 'fecha', 'metodo_pago', 'observacion'];

module.exports = {
    obtenerEgresos: (req, res) => {
        responder(res, objEgresoModel.ObtenerEgresos());
    },
    obtenerComprobante: (req, res) => {
        responder(res, objEgresoModel.ObtenerComprobante(req.query.id_egreso));
    },
    guardarEgreso: (req, res) => {
        let data = { id_egreso: req.body.id_egreso, ...leerCampos(req.body, CAMPOS) };
        if (data.id_egreso == 0) {
            responder(res, objEgresoModel.GuardarEgreso(data).then((nuevo) => nuevo.id_egreso));
        } else {
            responder(res, objEgresoModel.ActualizarEgreso(data));
        }
    },
    anularEgreso: (req, res) => {
        let motivo = leerMotivo(req.body);
        if (motivo === '') {
            return rechazar(res, 'Indique el motivo de la anulación');
        }
        responder(res, objEgresoModel.AnularEgreso({ id_egreso: req.body.id_egreso, motivo }));
    }
};
