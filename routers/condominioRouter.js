const express = require('express');
const router = express.Router();
const controller = require('../controllers/condominioController');
const { soloAdmin } = require('../middlewares/sesion');

router.get('/obtenerCondominio', controller.obtenerCondominio);
router.get('/obtenerCondominios', controller.obtenerCondominios);
router.post('/seleccionarCondominio', controller.seleccionarCondominio);
router.post('/guardarCondominio', soloAdmin, controller.guardarCondominio);
router.post('/crearCondominio', soloAdmin, controller.crearCondominio);
router.post('/eliminarCondominio', soloAdmin, controller.eliminarCondominio);

module.exports = router;
