const condominioModel = require('../models/condominioModel');
const { responder, rechazar, leerCampos, esDiaVencimiento } = require('./respuesta');
const objCondominioModel = new condominioModel();

const CAMPOS = ['nombre', 'direccion', 'nit', 'telefono', 'correo', 'dia_vencimiento'];
const CAMPOS_NUEVO = ['nombre', 'direccion', 'dia_vencimiento'];
const MENSAJE_DIA = 'El día de vencimiento debe estar entre 1 y 28';

module.exports = {
    // Datos del condominio en el que se está trabajando (Configuración y comprobantes)
    obtenerCondominio: (req, res) => {
        responder(res, objCondominioModel.ObtenerCondominio(req.idCondominio));
    },
    guardarCondominio: (req, res) => {
        let data = leerCampos(req.body, CAMPOS);
        if (!esDiaVencimiento(Number(data.dia_vencimiento))) {
            return rechazar(res, MENSAJE_DIA);
        }
        responder(res, objCondominioModel.ActualizarCondominio(req.idCondominio, data));
    },
    // Todos los condominios que puede ver el usuario, con su resumen financiero
    obtenerCondominios: (req, res) => {
        responder(res, objCondominioModel.ObtenerResumen(req.usuario));
    },
    crearCondominio: (req, res) => {
        let data = leerCampos(req.body, CAMPOS_NUEVO);
        if (!esDiaVencimiento(Number(data.dia_vencimiento))) {
            return rechazar(res, MENSAJE_DIA);
        }
        // Los tipos de departamento se copian del condominio en el que se está trabajando
        data.copiar_tipos_de = req.body.copiar_tipos === true ? req.idCondominio : null;
        responder(res, objCondominioModel.GuardarCondominio(data).then((nuevo) => nuevo.id_condominio));
    },
    eliminarCondominio: (req, res) => {
        responder(res, objCondominioModel.EliminarCondominio(req.body.id_condominio));
    },
    // Cambia el condominio en el que trabaja el usuario (queda guardado en su sesión)
    seleccionarCondominio: (req, res) => {
        let idCondominio = Number(req.body.id_condominio);
        if (!req.condominios.some((c) => c.id_condominio === idCondominio)) {
            return rechazar(res, 'No tiene acceso a ese condominio');
        }
        req.session.id_condominio = idCondominio;
        responder(res, Promise.resolve());
    }
};
