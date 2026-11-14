const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

router.get(['/', '/persona', '/departamento', '/departamento/ficha', '/residente',
    '/cargo', '/ingreso', '/ingreso/comprobante', '/egreso', '/egreso/comprobante', '/configuracion', '/usuario'], controller.get);

module.exports = router;
