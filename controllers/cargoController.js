const cargoModel = require('../models/cargoModel');
const { responder, rechazar, leerCampos, PERIODO, esDiaVencimiento } = require('./respuesta');
const objCargoModel = new cargoModel();

const CAMPOS = ['id_departamento', 'concepto', 'periodo', 'monto', 'vencimiento'];

module.exports = {
    obtenerCargos: (req, res) => {
        responder(res, objCargoModel.ObtenerCargos(req.idCondominio));
    },
    guardarCargo: (req, res) => {
        let data = { id_cargo: req.body.id_cargo, ...leerCampos(req.body, CAMPOS) };
        if (data.periodo && !PERIODO.test(data.periodo)) {
            return rechazar(res, 'El período debe tener el formato AAAA-MM');
        }
        if (data.id_cargo == 0) {
            responder(res, objCargoModel.GuardarCargo(req.idCondominio, data).then((nuevo) => nuevo.id_cargo));
        } else {
            responder(res, objCargoModel.ActualizarCargo(req.idCondominio, data));
        }
    },
    eliminarCargo: (req, res) => {
        responder(res, objCargoModel.EliminarCargo(req.idCondominio, { id_cargo: req.body.id_cargo }));
    },
    generarExpensas: (req, res) => {
        let periodo = req.body.periodo;
        let dia = Number(req.body.dia_vencimiento);
        if (!PERIODO.test(periodo || '')) {
            return rechazar(res, 'Seleccione el mes de las expensas');
        }
        if (!esDiaVencimiento(dia)) {
            return rechazar(res, 'El día de vencimiento debe estar entre 1 y 28');
        }
        responder(res, objCargoModel.GenerarExpensas(req.idCondominio, { periodo, dia_vencimiento: dia }));
    }
};
