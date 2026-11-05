const departamentoModel = require('../models/departamentoModel');
const { responder, leerCampos } = require('./respuesta');
const objDepartamentoModel = new departamentoModel();

const CAMPOS = ['numero', 'piso', 'estado', 'id_tipo_departamento', 'metros_cuadrados'];

module.exports = {
    obtenerDepartamentos: (req, res) => {
        responder(res, objDepartamentoModel.ObtenerDepartamentos());
    },
    obtenerFicha: (req, res) => {
        responder(res, objDepartamentoModel.ObtenerFicha(req.query.id_departamento));
    },
    guardarDepartamento: (req, res) => {
        let data = { id_departamento: req.body.id_departamento, ...leerCampos(req.body, CAMPOS) };
        if (data.id_departamento == 0) {
            responder(res, objDepartamentoModel.GuardarDepartamento(data).then((nuevo) => nuevo.id_departamento));
        } else {
            responder(res, objDepartamentoModel.ActualizarDepartamento(data));
        }
    },
    eliminarDepartamento: (req, res) => {
        responder(res, objDepartamentoModel.EliminarDepartamento({ id_departamento: req.body.id_departamento }));
    }
}
