const db = require('./db');

// Lista todos los tipos de departamento
async function obtenerTiposDepartamento() {
    let sql = 'SELECT * FROM tipo_departamento ORDER BY nombre';
    let resultado = await db.query(sql);
    return resultado.rows;
}

// Busca un tipo de departamento por su id
async function obtenerTipoDepartamento(id_tipo_departamento) {
    let sql = 'SELECT * FROM tipo_departamento WHERE id_tipo_departamento = $1';
    let params = [id_tipo_departamento];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Inserta un tipo de departamento y devuelve el id nuevo
async function guardarTipoDepartamento(data) {
    let sql = 'INSERT INTO tipo_departamento (nombre, descripcion, cuota_mensual) VALUES ($1, $2, $3) RETURNING id_tipo_departamento';
    let params = [data.nombre, data.descripcion, data.cuota_mensual];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Actualiza los datos de un tipo de departamento
async function actualizarTipoDepartamento(data) {
    let sql = 'UPDATE tipo_departamento SET nombre = $1, descripcion = $2, cuota_mensual = $3 WHERE id_tipo_departamento = $4';
    let params = [data.nombre, data.descripcion, data.cuota_mensual, data.id_tipo_departamento];
    await db.query(sql, params);
}

// Elimina un tipo de departamento
async function eliminarTipoDepartamento(data) {
    let sql = 'DELETE FROM tipo_departamento WHERE id_tipo_departamento = $1';
    let params = [data.id_tipo_departamento];
    await db.query(sql, params);
}

module.exports = {
    obtenerTiposDepartamento,
    obtenerTipoDepartamento,
    guardarTipoDepartamento,
    actualizarTipoDepartamento,
    eliminarTipoDepartamento
};
