const db = require('./db');

// Un solo condominio por instalación
const ID_CONDOMINIO = 1;

// Lista todos los departamentos del condominio con el nombre y la cuota de su tipo
async function obtenerDepartamentos() {
    let sql = 'SELECT d.*, t.nombre AS tipo_departamento, t.cuota_mensual FROM departamento d ' +
        'INNER JOIN tipo_departamento t ON t.id_tipo_departamento = d.id_tipo_departamento ' +
        'WHERE d.id_condominio = $1 ORDER BY d.piso, d.numero';
    let params = [ID_CONDOMINIO];
    let resultado = await db.query(sql, params);
    return resultado.rows;
}

// Busca un departamento por su id
async function obtenerDepartamento(id_departamento) {
    let sql = 'SELECT * FROM departamento WHERE id_departamento = $1 AND id_condominio = $2';
    let params = [id_departamento, ID_CONDOMINIO];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Inserta un departamento y devuelve el id nuevo
async function guardarDepartamento(data) {
    let sql = 'INSERT INTO departamento (id_condominio, numero, piso, estado, id_tipo_departamento, metros_cuadrados) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_departamento';
    let params = [ID_CONDOMINIO, data.numero, data.piso, data.estado, data.id_tipo_departamento, data.metros_cuadrados];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Actualiza los datos de un departamento
async function actualizarDepartamento(data) {
    let sql = 'UPDATE departamento SET numero = $1, piso = $2, estado = $3, id_tipo_departamento = $4, metros_cuadrados = $5 WHERE id_departamento = $6 AND id_condominio = $7';
    let params = [data.numero, data.piso, data.estado, data.id_tipo_departamento, data.metros_cuadrados, data.id_departamento, ID_CONDOMINIO];
    await db.query(sql, params);
}

// Elimina un departamento
async function eliminarDepartamento(data) {
    let sql = 'DELETE FROM departamento WHERE id_departamento = $1 AND id_condominio = $2';
    let params = [data.id_departamento, ID_CONDOMINIO];
    await db.query(sql, params);
}

module.exports = {
    obtenerDepartamentos,
    obtenerDepartamento,
    guardarDepartamento,
    actualizarDepartamento,
    eliminarDepartamento
};
