const personaModel = require('../models/personaModel');
const { responder, leerCampos } = require('./respuesta');
const objPersonaModel = new personaModel();

const CAMPOS = ['nombre', 'telefono', 'correo'];

module.exports = {
    obtenerPersonas: (req, res) => {
        responder(res, objPersonaModel.ObtenerPersonas());
    },
    guardarPersona: (req, res) => {
        let data = { id_persona: req.body.id_persona, ...leerCampos(req.body, CAMPOS) };
        if (data.id_persona == 0) {
            responder(res, objPersonaModel.GuardarPersona(data).then((nuevo) => nuevo.id_persona));
        } else {
            responder(res, objPersonaModel.ActualizarPersona(data));
        }
    },
    eliminarPersona: (req, res) => {
        responder(res, objPersonaModel.EliminarPersona({ id_persona: req.body.id_persona }));
    }
}
