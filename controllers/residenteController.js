const residenteModel = require('../models/residenteModel');
const { responder, leerCampos } = require('./respuesta');
const objResidenteModel = new residenteModel();

const CAMPOS = ['id_departamento', 'id_persona', 'tipo_relacion', 'fecha_inicio', 'fecha_fin', 'estado'];

module.exports = {
    obtenerResidentes: (req, res) => {
        responder(res, objResidenteModel.ObtenerResidentes());
    },
    guardarResidente: (req, res) => {
        let data = {
            id_residente: req.body.id_residente, ...leerCampos(req.body, CAMPOS),
            confirmar_copropiedad: req.body.confirmar_copropiedad === true
        };
        if (data.id_residente == 0) {
            responder(res, objResidenteModel.GuardarResidente(data).then((nuevo) => nuevo.id_residente));
        } else {
            responder(res, objResidenteModel.ActualizarResidente(data));
        }
    },
    eliminarResidente: (req, res) => {
        responder(res, objResidenteModel.EliminarResidente({ id_residente: req.body.id_residente }));
    }
};
