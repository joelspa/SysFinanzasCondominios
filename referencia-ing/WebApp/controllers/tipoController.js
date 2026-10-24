const path = require('path');
const tipoModel = require('../models/tipoModel');
const objTipoModel = new tipoModel();

module.exports = {
    get: (req, res) => {
        res.sendFile(path.resolve(__dirname, '../views/tipo.html'));
    },
    obtenerTipos: (req, res) => {
        objTipoModel.ObtenerTipos().then(function (data) {
            res.type('json');
            res.send({ "Success": true, "Data": data });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": error.message });
        });
    },
    guardarTipo: (req, res) => {
        var data = {
            idtipo: req.body.idtipo, nombre: req.body.nombre,
            descripcion: req.body.descripcion
        };
        if (data.idtipo == 0) {
            objTipoModel.GuardarTipo(data).then(data => {
                res.type('json');
                res.send({ "Success": true, "Data": data.idtipo });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": error.message });
            });
        } else {
            objTipoModel.ActualizarTipo(data).then(function () {
                res.type('json');
                res.send({ "Success": true });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": error.message });
            });
        }
    },
    eliminarTipo: (req, res) => {
        var data = { idtipo: req.body.idtipo }
        objTipoModel.EliminarTipo(data).then(function () {
            res.type('json');
            res.send({ "Success": true });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": error.message });
        });
    }
}   