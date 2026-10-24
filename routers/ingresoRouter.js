const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingresoController');

router.get('/', controller.obtenerIngresos);
router.get('/:id', controller.obtenerIngreso);
router.post('/', controller.guardarIngreso);
router.put('/:id', controller.actualizarIngreso);
router.delete('/:id', controller.eliminarIngreso);

module.exports = router;
