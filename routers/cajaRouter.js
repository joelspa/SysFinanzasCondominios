const express = require('express');
const router = express.Router();
const controller = require('../controllers/cajaController');

router.get('/obtenerCaja', controller.obtenerCaja);
router.post('/guardarMovimiento', controller.guardarMovimiento);
router.post('/anularMovimiento', controller.anularMovimiento);

module.exports = router;
