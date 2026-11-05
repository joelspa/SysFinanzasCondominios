const ingresoModel = require('../models/ingresoModel');
const { responder, rechazar, leerCampos } = require('./respuesta');
const { MAX_MESES_ADELANTO } = require('../models/config');
const objIngresoModel = new ingresoModel();

const CAMPOS = ['id_departamento', 'id_tipo_ingreso', 'concepto', 'monto', 'fecha', 'metodo_pago', 'aplica_deuda'];

module.exports = {
    obtenerIngresos: (req, res) => {
        responder(res, objIngresoModel.ObtenerIngresos());
    },
    obtenerComprobante: (req, res) => {
        responder(res, objIngresoModel.ObtenerComprobante(req.query.id_ingreso));
    },
    guardarIngreso: (req, res) => {
        let data = { id_ingreso: req.body.id_ingreso, ...leerCampos(req.body, CAMPOS) };
        if (data.id_ingreso != 0) {
            return responder(res, objIngresoModel.ActualizarIngreso(data));
        }
        let meses = Number(req.body.meses_adelantados || 0);
        if (!Number.isInteger(meses) || meses < 0 || meses > MAX_MESES_ADELANTO) {
            return rechazar(res, 'Los meses adelantados deben estar entre 0 y ' + MAX_MESES_ADELANTO);
        }
        if (meses > 0 && !data.aplica_deuda) {
            return rechazar(res, 'Para adelantar meses el pago debe aplicarse a la deuda del departamento');
        }
        responder(res, objIngresoModel.GuardarIngreso({ ...data, meses_adelantados: meses }).then((nuevo) => nuevo.id_ingreso));
    },
    anularIngreso: (req, res) => {
        let motivo = String(req.body.motivo || '').trim();
        if (motivo === '') {
            return rechazar(res, 'Indique el motivo de la anulación');
        }
        responder(res, objIngresoModel.AnularIngreso({ id_ingreso: req.body.id_ingreso, motivo }));
    }
}
