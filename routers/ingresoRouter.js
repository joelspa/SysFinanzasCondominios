const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingresoController');

router.get('/obtenerIngresos', controller.obtenerIngresos);
router.post('/guardarIngreso', controller.guardarIngreso);
router.post('/eliminarIngreso', controller.eliminarIngreso);

module.exports = router;
