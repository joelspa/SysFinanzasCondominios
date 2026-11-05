const traspasoModel = require('../models/traspasoModel');
const { responder, rechazar, leerCampos } = require('./respuesta');
const objTraspasoModel = new traspasoModel();

const CAMPOS = ['id_departamento', 'id_propietario_nuevo', 'fecha', 'observacion'];

module.exports = {
    obtenerTraspasos: (req, res) => {
        responder(res, objTraspasoModel.ObtenerTraspasos());
    },
    realizarTraspaso: (req, res) => {
        let data = { ...leerCampos(req.body, CAMPOS), confirmar_deuda: req.body.confirmar_deuda === true };
        if (!data.id_departamento || !data.id_propietario_nuevo || !data.fecha) {
            return rechazar(res, 'Complete todos los campos obligatorios');
        }
        responder(res, objTraspasoModel.RealizarTraspaso(data).then((nuevo) => nuevo.id_traspaso));
    }
}
