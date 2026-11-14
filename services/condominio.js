const dao = require('../models/dao');
const objDao = new dao();

// Reglas de pertenencia: cada condominio trabaja solo con sus propios departamentos y tipos.
// Los modelos las llaman antes de guardar, por si la petición trae el id de otro condominio.
// Un id vacío se deja pasar: si el campo era obligatorio, la base de datos lo rechaza con su mensaje.

async function validarDepartamento(idCondominio, idDepartamento) {
    if (idDepartamento === null || idDepartamento === undefined) {
        return;
    }
    let sql = 'SELECT id_departamento FROM departamento WHERE id_departamento = $1 AND id_condominio = $2';
    if (!await objDao.obtenerUno(sql, [idDepartamento, idCondominio])) {
        throw new Error('El departamento no pertenece a este condominio');
    }
}

async function validarTipoDepartamento(idCondominio, idTipo) {
    if (idTipo === null || idTipo === undefined) {
        return;
    }
    let sql = 'SELECT id_tipo_departamento FROM tipo_departamento WHERE id_tipo_departamento = $1 AND id_condominio = $2';
    if (!await objDao.obtenerUno(sql, [idTipo, idCondominio])) {
        throw new Error('El tipo de departamento no pertenece a este condominio');
    }
}

module.exports = { validarDepartamento, validarTipoDepartamento };
