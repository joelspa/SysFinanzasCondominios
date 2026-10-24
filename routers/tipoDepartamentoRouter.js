const express = require('express');
const router = express.Router();
const controller = require('../controllers/tipoDepartamentoController');

router.get('/', controller.obtenerTiposDepartamento);
router.get('/:id', controller.obtenerTipoDepartamento);
router.post('/', controller.guardarTipoDepartamento);
router.put('/:id', controller.actualizarTipoDepartamento);
router.delete('/:id', controller.eliminarTipoDepartamento);

module.exports = router;
