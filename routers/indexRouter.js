const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

router.get(['/', '/login', '/condominio', '/ayuda', '/persona', '/departamento', '/departamento/ficha', '/residente',
    '/cargo', '/ingreso', '/ingreso/comprobante', '/egreso', '/egreso/comprobante', '/caja', '/reporte', '/cargo/avisos', '/configuracion', '/usuario'], controller.get);

module.exports = router;
