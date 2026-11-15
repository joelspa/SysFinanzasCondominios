const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

router.get(['/', '/login', '/condominio', '/persona', '/departamento', '/departamento/ficha', '/residente',
    '/cargo', '/ingreso', '/ingreso/comprobante', '/egreso', '/egreso/comprobante', '/caja', '/configuracion', '/usuario'], controller.get);

module.exports = router;
