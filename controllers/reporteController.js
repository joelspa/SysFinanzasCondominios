const reporteModel = require('../models/reporteModel');
const { responder, rechazar, PERIODO } = require('./respuesta');
const objReporteModel = new reporteModel();

module.exports = {
    obtenerMensual: (req, res) => {
        let periodo = req.query.periodo || '';
        if (!PERIODO.test(periodo)) {
            return rechazar(res, 'Seleccione el mes del reporte');
        }
        responder(res, objReporteModel.ObtenerMensual(req.idCondominio, periodo));
    }
};
