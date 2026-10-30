const residenteModel = require('../models/residenteModel');
const mensajeError = require('./mensajeError');
const objResidenteModel = new residenteModel();

module.exports = {
    obtenerResidentes: (req, res) => {
        objResidenteModel.ObtenerResidentes().then(function (data) {
            res.type('json');
            res.send({ "Success": true, "Data": data });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    },
    guardarResidente: (req, res) => {
        var data = {
            id_residente: req.body.id_residente, id_departamento: req.body.id_departamento || null,
            id_persona: req.body.id_persona || null, tipo_relacion: req.body.tipo_relacion || null,
            fecha_inicio: req.body.fecha_inicio || null, fecha_fin: req.body.fecha_fin || null,
            estado: req.body.estado || null
        };
        if (data.id_residente == 0) {
            objResidenteModel.GuardarResidente(data).then(data => {
                res.type('json');
                res.send({ "Success": true, "Data": data.id_residente });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        } else {
            objResidenteModel.ActualizarResidente(data).then(function () {
                res.type('json');
                res.send({ "Success": true });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        }
    },
    eliminarResidente: (req, res) => {
        var data = { id_residente: req.body.id_residente };
        objResidenteModel.EliminarResidente(data).then(function () {
            res.type('json');
            res.send({ "Success": true });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    }
}
