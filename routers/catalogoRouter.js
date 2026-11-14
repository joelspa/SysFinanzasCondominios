const express = require('express');
const router = express.Router();
const controladores = require('../controllers/catalogoController');
const { soloAdmin } = require('../middlewares/sesion');

// Las mismas tres rutas para cada catálogo:
//   /api/catalogo/tipoDepartamento/obtener, /api/catalogo/tipoDepartamento/guardar, ...
// Todos pueden leerlos (llenan los formularios); cambiarlos es parte de la configuración: solo el administrador.
for (const [nombre, controller] of Object.entries(controladores)) {
    router.get(`/${nombre}/obtener`, controller.obtener);
    router.post(`/${nombre}/guardar`, soloAdmin, controller.guardar);
    router.post(`/${nombre}/eliminar`, soloAdmin, controller.eliminar);
}

module.exports = router;
