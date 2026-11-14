const ingresoModel = require('../models/ingresoModel');
const { MAX_MESES_ADELANTO } = require('../config/config');
const { responder, rechazar, leerCampos, leerMotivo } = require('./respuesta');
const objIngresoModel = new ingresoModel();

const CAMPOS = ['id_departamento', 'id_tipo_ingreso', 'concepto', 'monto', 'fecha', 'metodo_pago', 'aplica_deuda'];

module.exports = {
    obtenerIngresos: (req, res) => {
        responder(res, objIngresoModel.ObtenerIngresos(req.idCondominio));
    },
    obtenerComprobante: (req, res) => {
        responder(res, objIngresoModel.ObtenerComprobante(req.idCondominio, req.query.id_ingreso));
    },
    guardarIngreso: (req, res) => {
        let data = { id_ingreso: req.body.id_ingreso, ...leerCampos(req.body, CAMPOS) };
        // Sin departamento es un ingreso del condominio: no hay deuda a la que aplicarlo
        if (!data.id_departamento && data.aplica_deuda) {
            return rechazar(res, 'Un ingreso sin departamento no puede aplicarse a una deuda');
        }
        if (data.id_ingreso != 0) {
            return responder(res, objIngresoModel.ActualizarIngreso(req.idCondominio, data));
        }
        let meses = Number(req.body.meses_adelantados || 0);
        if (!Number.isInteger(meses) || meses < 0 || meses > MAX_MESES_ADELANTO) {
            return rechazar(res, 'Los meses adelantados deben estar entre 0 y ' + MAX_MESES_ADELANTO);
        }
        if (meses > 0 && !data.aplica_deuda) {
            return rechazar(res, 'Para adelantar meses el pago debe aplicarse a la deuda del departamento');
        }
        let nuevo = { ...data, meses_adelantados: meses, id_usuario: req.usuario.id_usuario };
        responder(res, objIngresoModel.GuardarIngreso(req.idCondominio, nuevo).then((ingreso) => ingreso.id_ingreso));
    },
    anularIngreso: (req, res) => {
        let motivo = leerMotivo(req.body);
        if (motivo === '') {
            return rechazar(res, 'Indique el motivo de la anulación');
        }
        responder(res, objIngresoModel.AnularIngreso(req.idCondominio, { id_ingreso: req.body.id_ingreso, motivo }));
    }
};
