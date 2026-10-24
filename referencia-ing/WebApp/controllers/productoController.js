const path = require('path');
const productoModel = require('../models/productoModel');
const objProductoModel = new productoModel();

module.exports = {
    get: (req, res) => {
        res.sendFile(path.resolve(__dirname, '../views/producto.html'));
    },

    obtenerProductos: (req, res) => {
        objProductoModel.ObtenerProductos().then(function (data) {
            res.type('json');
            res.send({ "Success": true, "Data": data });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": error.message });
        });
    },
    guardarProducto: (req, res) => {
        var data = {
            idproducto: req.body.idproducto, nombre: req.body.nombre,
            descripcion: req.body.descripcion, precio: req.body.precio,
            cantidad: req.body.cantidad, idtipo: req.body.idtipo
        };
        if (data.idproducto == 0) {
            objProductoModel.GuardarProducto(data).then(data => {
                res.type('json');
                res.send({ "Success": true, "Data": data.idproducto });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": error.message });
            });
        } else {
            objProductoModel.ActualizarProducto(data).then(function () {
                res.type('json');
                res.send({ "Success": true });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": error.message });
            });
        }
    },
    eliminarProducto: (req, res) => {
        var data = { idproducto: req.body.idproducto }
        objProductoModel.EliminarProducto(data).then(function () {
            res.type('json');
            res.send({ "Success": true });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": error.message });
        });
    }

}
