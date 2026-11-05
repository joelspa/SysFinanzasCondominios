const express = require('express');
const router = express.Router();
const controladores = require('../controllers/catalogoController');

// Las mismas tres rutas para cada catálogo:
//   /api/catalogo/tipoDepartamento/obtener, /api/catalogo/tipoDepartamento/guardar, ...
for (const [nombre, controller] of Object.entries(controladores)) {
    router.get(`/${nombre}/obtener`, controller.obtener);
    router.post(`/${nombre}/guardar`, controller.guardar);
    router.post(`/${nombre}/eliminar`, controller.eliminar);
}

module.exports = router;
