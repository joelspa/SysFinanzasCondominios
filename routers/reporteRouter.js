const express = require('express');
const router = express.Router();
const controller = require('../controllers/reporteController');

router.get('/obtenerMensual', controller.obtenerMensual);

module.exports = router;
