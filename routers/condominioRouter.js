const express = require('express');
const router = express.Router();
const controller = require('../controllers/condominioController');

router.get('/obtenerCondominio', controller.obtenerCondominio);
router.post('/guardarCondominio', controller.guardarCondominio);

module.exports = router;
