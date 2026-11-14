const express = require('express');
const router = express.Router();
const controller = require('../controllers/departamentoController');

router.get('/obtenerDepartamentos', controller.obtenerDepartamentos);
router.get('/obtenerFicha', controller.obtenerFicha);
router.post('/guardarDepartamento', controller.guardarDepartamento);
router.post('/eliminarDepartamento', controller.eliminarDepartamento);

module.exports = router;
