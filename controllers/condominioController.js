const condominioModel = require('../models/condominioModel');
const { responder, rechazar, leerCampos } = require('./respuesta');
const objCondominioModel = new condominioModel();

const CAMPOS = ['nombre', 'direccion', 'nit', 'telefono', 'correo', 'dia_vencimiento'];

module.exports = {
    obtenerCondominio: (req, res) => {
        responder(res, objCondominioModel.ObtenerCondominio());
    },
    guardarCondominio: (req, res) => {
        let data = leerCampos(req.body, CAMPOS);
        let dia = Number(data.dia_vencimiento);
        if (!Number.isInteger(dia) || dia < 1 || dia > 28) {
            return rechazar(res, 'El día de vencimiento debe estar entre 1 y 28');
        }
        responder(res, objCondominioModel.ActualizarCondominio(data));
    }
}
