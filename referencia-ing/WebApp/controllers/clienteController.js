const path = require('path');
const clienteModel = require('../models/clienteModel');
const objClienteModel = new clienteModel();

module.exports = {
    get: (req, res) => {
        res.sendFile(path.resolve(__dirname, '../views/cliente.html'));
    },
    obtenerClientes: (req, res) => {
        objClienteModel.ObtenerClientes().then(function (data) {
            res.type('json');
            res.send({ "Success": true, "Data": data });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": error.message });
        });
    },
    guardarCliente: (req, res) => {
        var data = {
            idcliente: req.body.idcliente, ci: req.body.ci, nombres: req.body.nombres, apellidos: req.body.apellidos, direccion: req.body.direccion, telefono: req.body.telefono,
            correo: req.body.correo, fecnac: req.body.fecnac || null
        };
        if (data.idcliente == 0) {
            objClienteModel.GuardarCliente(data).then(data => {
                res.type('json');
                res.send({ "Success": true, "Data": data.idcliente });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": error.message });
            });
        } else {
            objClienteModel.ActualizarCliente(data).then(function () {
                res.type('json');
                res.send({ "Success": true });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": error.message });
            });
        }
    },
    eliminarCliente: (req, res) => {
        var data = { idcliente: req.body.idcliente }
        objClienteModel.EliminarCliente(data).then(function () {
            res.type('json');
            res.send({ "Success": true });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": error.message });
        });
    }
}
