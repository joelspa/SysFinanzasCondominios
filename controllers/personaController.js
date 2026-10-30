const personaModel = require('../models/personaModel');
const mensajeError = require('./mensajeError');
const objPersonaModel = new personaModel();

module.exports = {
    obtenerPersonas: (req, res) => {
        objPersonaModel.ObtenerPersonas().then(function (data) {
            res.type('json');
            res.send({ "Success": true, "Data": data });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    },
    guardarPersona: (req, res) => {
        var data = {
            id_persona: req.body.id_persona, nombre: req.body.nombre || null,
            telefono: req.body.telefono || null, correo: req.body.correo || null
        };
        if (data.id_persona == 0) {
            objPersonaModel.GuardarPersona(data).then(data => {
                res.type('json');
                res.send({ "Success": true, "Data": data.id_persona });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        } else {
            objPersonaModel.ActualizarPersona(data).then(function () {
                res.type('json');
                res.send({ "Success": true });
            }).catch(function (error) {
                res.type('json');
                res.send({ "Success": false, "Mensaje": mensajeError(error) });
            });
        }
    },
    eliminarPersona: (req, res) => {
        var data = { id_persona: req.body.id_persona };
        objPersonaModel.EliminarPersona(data).then(function () {
            res.type('json');
            res.send({ "Success": true });
        }).catch(function (error) {
            res.type('json');
            res.send({ "Success": false, "Mensaje": mensajeError(error) });
        });
    }
}
