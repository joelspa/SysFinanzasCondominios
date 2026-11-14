const catalogoModel = require('../models/catalogoModel');
const catalogos = require('../config/catalogos');
const { responder, leerCampos } = require('./respuesta');

// Crea las funciones del controlador para un catálogo (obtener, guardar, eliminar)
function crearControlador(config) {
    const modelo = new catalogoModel(config);
    return {
        obtener: (req, res) => {
            responder(res, modelo.Obtener());
        },
        guardar: (req, res) => {
            let data = { [config.id]: req.body[config.id], ...leerCampos(req.body, config.campos) };
            if (data[config.id] == 0) {
                responder(res, modelo.Guardar(data).then((nuevo) => nuevo[config.id]));
            } else {
                responder(res, modelo.Actualizar(data));
            }
        },
        eliminar: (req, res) => {
            responder(res, modelo.Eliminar({ [config.id]: req.body[config.id] }));
        }
    };
}

// { tipoDepartamento: { obtener, guardar, eliminar }, tipoIngreso: {...}, tipoEgreso: {...} }
module.exports = Object.fromEntries(
    Object.entries(catalogos).map(([nombre, config]) => [nombre, crearControlador(config)])
);
