const express = require('express');
const router = express.Router();
const controller = require('../controllers/residenteController');

router.get('/obtenerResidentes', controller.obtenerResidentes);
router.post('/guardarResidente', controller.guardarResidente);
router.post('/eliminarResidente', controller.eliminarResidente);

module.exports = router;
