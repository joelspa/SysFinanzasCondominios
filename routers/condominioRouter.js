const express = require('express');
const router = express.Router();
const controller = require('../controllers/condominioController');
const { soloAdmin } = require('../middlewares/sesion');

router.get('/obtenerCondominio', controller.obtenerCondominio);
router.post('/guardarCondominio', soloAdmin, controller.guardarCondominio);

module.exports = router;
