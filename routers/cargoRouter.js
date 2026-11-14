const express = require('express');
const router = express.Router();
const controller = require('../controllers/cargoController');

router.get('/obtenerCargos', controller.obtenerCargos);
router.post('/guardarCargo', controller.guardarCargo);
router.post('/eliminarCargo', controller.eliminarCargo);
router.post('/generarExpensas', controller.generarExpensas);

module.exports = router;
