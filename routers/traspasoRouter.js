const express = require('express');
const router = express.Router();
const controller = require('../controllers/traspasoController');

router.get('/obtenerTraspasos', controller.obtenerTraspasos);
router.post('/realizarTraspaso', controller.realizarTraspaso);

module.exports = router;
