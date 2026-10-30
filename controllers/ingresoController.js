const ingresoModel = require('../models/ingresoModel');
const mensajeError = require('./mensajeError');
const objIngresoModel = new ingresoModel();

module.exports = {
    obtenerIngresos: (req, res) => {
        objIngresoModel.ObtenerIngresos().then(function (data) {
            res.type('json');
            res.send({ "Success": true, "Data": data });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    },
    guardarIngreso: (req, res) => {
        var data = {
            id_ingreso: req.body.id_ingreso, id_departamento: req.body.id_departamento || null,
            id_tipo_ingreso: req.body.id_tipo_ingreso || null, id_cargo: req.body.id_cargo || null,
            concepto: req.body.concepto || null, monto: req.body.monto || null,
            fecha: req.body.fecha || null, metodo_pago: req.body.metodo_pago || null,
            estado: req.body.estado || null
        };
        if (data.id_ingreso == 0) {
            objIngresoModel.GuardarIngreso(data).then(data => {
                res.type('json');
                res.send({ "Success": true, "Data": data.id_ingreso });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        } else {
            objIngresoModel.ActualizarIngreso(data).then(function () {
                res.type('json');
                res.send({ "Success": true });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        }
    },
    eliminarIngreso: (req, res) => {
        var data = { id_ingreso: req.body.id_ingreso };
        objIngresoModel.EliminarIngreso(data).then(function () {
            res.type('json');
            res.send({ "Success": true });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    }
}
