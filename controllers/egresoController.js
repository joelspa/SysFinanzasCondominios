const egresoModel = require('../models/egresoModel');
const { responder, rechazar, leerCampos, leerMotivo, esFechaFutura } = require('./respuesta');
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
        // Al editar solo se guardan los datos que no mueven dinero (el modelo ignora el resto)
        if (data.id_egreso != 0) {
            return responder(res, objEgresoModel.ActualizarEgreso(req.idCondominio, data));
        }
        if (data.fecha && esFechaFutura(data.fecha)) {
            return rechazar(res, 'La fecha del gasto no puede ser posterior a hoy');
        }
        let nuevo = { ...data, id_usuario: req.usuario.id_usuario };
        responder(res, objEgresoModel.GuardarEgreso(req.idCondominio, nuevo).then((egreso) => egreso.id_egreso));
    },
    anularEgreso: (req, res) => {
        let motivo = leerMotivo(req.body);
        if (motivo === '') {
            return rechazar(res, 'Indique el motivo de la anulación');
        }
        let data = { id_egreso: req.body.id_egreso, motivo, id_usuario: req.usuario.id_usuario };
        responder(res, objEgresoModel.AnularEgreso(req.idCondominio, data));
    }
};
