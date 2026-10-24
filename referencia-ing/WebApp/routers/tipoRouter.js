const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoController');

router.get('/', controller.get);
router.get('/obtenerTipos', controller.obtenerTipos);
router.post('/guardarTipo', controller.guardarTipo);
router.post('/eliminarTipo', controller.eliminarTipo);

module.exports = router;