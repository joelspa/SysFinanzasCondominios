const express = require('express');
const router = express.Router();
const controller = require('../controllers/departamentoController');

router.get('/', controller.obtenerDepartamentos);
router.get('/:id', controller.obtenerDepartamento);
router.post('/', controller.guardarDepartamento);
router.put('/:id', controller.actualizarDepartamento);
router.delete('/:id', controller.eliminarDepartamento);

module.exports = router;
