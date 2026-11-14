const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingresoController');

router.get('/obtenerIngresos', controller.obtenerIngresos);
router.get('/obtenerComprobante', controller.obtenerComprobante);
router.post('/guardarIngreso', controller.guardarIngreso);
router.post('/anularIngreso', controller.anularIngreso);

module.exports = router;
