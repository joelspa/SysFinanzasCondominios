const express = require('express');
const router = express.Router();
const controller = require('../controllers/egresoController');

router.get('/obtenerEgresos', controller.obtenerEgresos);
router.get('/obtenerComprobante', controller.obtenerComprobante);
router.post('/guardarEgreso', controller.guardarEgreso);
router.post('/anularEgreso', controller.anularEgreso);

module.exports = router;
