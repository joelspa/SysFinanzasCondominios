const express = require('express');
const router = express.Router();
const controller = require('../controllers/clienteController');

router.get('/', controller.get);
router.get('/obtenerClientes', controller.obtenerClientes);
router.post('/guardarCliente', controller.guardarCliente);
router.post('/eliminarCliente', controller.eliminarCliente);

module.exports = router;