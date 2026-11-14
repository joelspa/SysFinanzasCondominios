const egresoModel = require('../models/egresoModel');
const { responder, rechazar, leerCampos, leerMotivo } = require('./respuesta');
const objEgresoModel = new egresoModel();

const CAMPOS = ['id_tipo_egreso', 'concepto', 'proveedor', 'numero_documento', 'monto', 'fecha', 'metodo_pago', 'observacion'];

module.exports = {
    obtenerEgresos: (req, res) => {
        responder(res, objEgresoModel.ObtenerEgresos(req.idCondominio));
    },
    obtenerComprobante: (req, res) => {
        responder(res, objEgresoModel.ObtenerComprobante(req.idCondominio, req.query.id_egreso));
    },
    guardarEgreso: (req, res) => {
        let data = { id_egreso: req.body.id_egreso, ...leerCampos(req.body, CAMPOS) };
        if (data.id_egreso == 0) {
            let nuevo = { ...data, id_usuario: req.usuario.id_usuario };
            responder(res, objEgresoModel.GuardarEgreso(req.idCondominio, nuevo).then((egreso) => egreso.id_egreso));
        } else {
            responder(res, objEgresoModel.ActualizarEgreso(req.idCondominio, data));
        }
    },
    anularEgreso: (req, res) => {
        let motivo = leerMotivo(req.body);
        if (motivo === '') {
            return rechazar(res, 'Indique el motivo de la anulación');
        }
        responder(res, objEgresoModel.AnularEgreso(req.idCondominio, { id_egreso: req.body.id_egreso, motivo }));
    }
};
