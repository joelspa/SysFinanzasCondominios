const express = require('express');
const router = express.Router();
const controller = require('../controllers/personaController');

router.get('/obtenerPersonas', controller.obtenerPersonas);
router.post('/guardarPersona', controller.guardarPersona);
router.post('/eliminarPersona', controller.eliminarPersona);

module.exports = router;
