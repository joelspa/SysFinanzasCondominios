const express = require('express');
const router = express.Router();
const controller = require('../controllers/personaController');

router.get('/', controller.obtenerPersonas);
router.get('/:id', controller.obtenerPersona);
router.post('/', controller.guardarPersona);
router.put('/:id', controller.actualizarPersona);
router.delete('/:id', controller.eliminarPersona);

module.exports = router;
