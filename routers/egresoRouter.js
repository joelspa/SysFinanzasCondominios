const express = require('express');
const router = express.Router();
const controller = require('../controllers/egresoController');

router.get('/', controller.obtenerEgresos);
router.get('/:id', controller.obtenerEgreso);
router.post('/', controller.guardarEgreso);
router.put('/:id', controller.actualizarEgreso);
router.delete('/:id', controller.eliminarEgreso);

module.exports = router;
