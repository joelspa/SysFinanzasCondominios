const express = require('express');
const router = express.Router();
const controller = require('../controllers/sesionController');
const { requiereSesion } = require('../middlewares/sesion');

// Ingresar y salir son las únicas rutas de la API que no piden una sesión abierta
router.post('/iniciarSesion', controller.iniciarSesion);
router.post('/cerrarSesion', controller.cerrarSesion);
router.get('/obtenerSesion', requiereSesion, controller.obtenerSesion);
router.post('/cambiarContrasena', requiereSesion, controller.cambiarContrasena);

module.exports = router;
