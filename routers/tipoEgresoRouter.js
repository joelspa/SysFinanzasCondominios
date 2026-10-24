const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoEgresoController');

router.get('/', controller.obtenerTiposEgreso);

module.exports = router;
