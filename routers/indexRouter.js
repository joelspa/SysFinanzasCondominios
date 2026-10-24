const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

router.get('/', controller.get);

const modulos = ['departamento', 'persona', 'tipo_departamento', 'ingreso', 'egreso'];
for (const modulo of modulos) {
    router.get([
        `/${modulo}`,
        `/${modulo}/nuevo`,
        `/${modulo}/:id/editar`,
        `/${modulo}/:id/eliminar`
    ], controller.get);
}

module.exports = router;
