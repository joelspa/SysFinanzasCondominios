const catalogoModel = require('../models/catalogoModel');
const catalogos = require('../config/catalogos');
const { responder, leerCampos } = require('./respuesta');

// Crea las funciones del controlador para un catálogo (obtener, guardar, eliminar).
// El condominio activo se pasa siempre; solo lo usan los catálogos que son por condominio.
function crearControlador(config) {
    const modelo = new catalogoModel(config);
    return {
        obtener: (req, res) => {
            responder(res, modelo.Obtener(req.idCondominio));
        },
        guardar: (req, res) => {
            let data = { [config.id]: req.body[config.id], ...leerCampos(req.body, config.campos) };
            if (data[config.id] == 0) {
                responder(res, modelo.Guardar(req.idCondominio, data).then((nuevo) => nuevo[config.id]));
            } else {
                responder(res, modelo.Actualizar(req.idCondominio, data));
            }
        },
        eliminar: (req, res) => {
            responder(res, modelo.Eliminar(req.idCondominio, { [config.id]: req.body[config.id] }));
        }
    };
}

// { tipoDepartamento: { obtener, guardar, eliminar }, tipoIngreso: {...}, tipoEgreso: {...} }
module.exports = Object.fromEntries(
    Object.entries(catalogos).map(([nombre, config]) => [nombre, crearControlador(config)])
);
