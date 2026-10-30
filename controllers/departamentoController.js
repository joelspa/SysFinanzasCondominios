const departamentoModel = require('../models/departamentoModel');
const mensajeError = require('./mensajeError');
const objDepartamentoModel = new departamentoModel();

module.exports = {
    obtenerDepartamentos: (req, res) => {
        objDepartamentoModel.ObtenerDepartamentos().then(function (data) {
            res.type('json');
            res.send({ "Success": true, "Data": data });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    },
    guardarDepartamento: (req, res) => {
        var data = {
            id_departamento: req.body.id_departamento, numero: req.body.numero || null,
            piso: req.body.piso || null, estado: req.body.estado || null,
            id_tipo_departamento: req.body.id_tipo_departamento || null,
            metros_cuadrados: req.body.metros_cuadrados || null
        };
        if (data.id_departamento == 0) {
            objDepartamentoModel.GuardarDepartamento(data).then(data => {
                res.type('json');
                res.send({ "Success": true, "Data": data.id_departamento });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        } else {
            objDepartamentoModel.ActualizarDepartamento(data).then(function () {
                res.type('json');
                res.send({ "Success": true });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        }
    },
    eliminarDepartamento: (req, res) => {
        var data = { id_departamento: req.body.id_departamento };
        objDepartamentoModel.EliminarDepartamento(data).then(function () {
            res.type('json');
            res.send({ "Success": true });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    }
}
