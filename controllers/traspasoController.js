const traspasoModel = require('../models/traspasoModel');
const { responder, rechazar, leerCampos, esFechaFutura } = require('./respuesta');
const objTraspasoModel = new traspasoModel();

const CAMPOS = ['id_departamento', 'id_propietario_nuevo', 'fecha', 'observacion'];

module.exports = {
    obtenerTraspasos: (req, res) => {
        responder(res, objTraspasoModel.ObtenerTraspasos(req.idCondominio));
    },
    realizarTraspaso: (req, res) => {
        let data = {
            ...leerCampos(req.body, CAMPOS), confirmar_deuda: req.body.confirmar_deuda === true,
            id_usuario: req.usuario.id_usuario
        };
        if (!data.id_departamento || !data.id_propietario_nuevo || !data.fecha) {
            return rechazar(res, 'Complete todos los campos obligatorios');
        }
        if (esFechaFutura(data.fecha)) {
            return rechazar(res, 'La fecha del traspaso no puede ser posterior a hoy');
        }
        responder(res, objTraspasoModel.RealizarTraspaso(req.idCondominio, data).then((nuevo) => nuevo.id_traspaso));
    }
};
