const express = require('express');
const router = express.Router();
const controller = require('../controllers/productoController');

router.get('/', controller.get);
router.get('/obtenerProductos', controller.obtenerProductos);
router.post('/guardarProducto', controller.guardarProducto);
router.post('/eliminarProducto', controller.eliminarProducto);

module.exports = router;
