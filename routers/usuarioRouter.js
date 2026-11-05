const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarioController');

router.get('/obtenerUsuarios', controller.obtenerUsuarios);
router.post('/guardarUsuario', controller.guardarUsuario);
router.post('/eliminarUsuario', controller.eliminarUsuario);

module.exports = router;
