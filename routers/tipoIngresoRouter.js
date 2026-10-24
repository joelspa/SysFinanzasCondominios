const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoIngresoController');

router.get('/', controller.obtenerTiposIngreso);

module.exports = router;
