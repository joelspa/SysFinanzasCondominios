const db = require('./db');

// Un solo condominio por instalación
const ID_CONDOMINIO = 1;
// Usuario que registra el ingreso: por ahora fijo, después vendrá del login
const ID_USUARIO = 1;

// Lista todos los ingresos del condominio con el número del departamento y el nombre del tipo
// (la fecha se devuelve como texto 'YYYY-MM-DD' para que no cambie por la zona horaria)
async function obtenerIngresos() {
    let sql = "SELECT i.id_ingreso, i.concepto, i.monto, TO_CHAR(i.fecha, 'YYYY-MM-DD') AS fecha, " +
        'i.estado, i.metodo_pago, i.id_departamento, i.id_tipo_ingreso, ' +
        'd.numero AS numero_departamento, t.nombre AS tipo_ingreso FROM ingreso i ' +
        'INNER JOIN departamento d ON d.id_departamento = i.id_departamento ' +
        'INNER JOIN tipo_ingreso t ON t.id_tipo_ingreso = i.id_tipo_ingreso ' +
        'WHERE d.id_condominio = $1 ORDER BY i.fecha DESC, i.id_ingreso DESC';
    let params = [ID_CONDOMINIO];
    let resultado = await db.query(sql, params);
    return resultado.rows;
}

// Busca un ingreso por su id
async function obtenerIngreso(id_ingreso) {
    let sql = "SELECT i.id_ingreso, i.concepto, i.monto, TO_CHAR(i.fecha, 'YYYY-MM-DD') AS fecha, " +
        'i.estado, i.metodo_pago, i.id_departamento, i.id_tipo_ingreso, d.numero AS numero_departamento FROM ingreso i ' +
        'INNER JOIN departamento d ON d.id_departamento = i.id_departamento ' +
        'WHERE i.id_ingreso = $1 AND d.id_condominio = $2';
    let params = [id_ingreso, ID_CONDOMINIO];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Inserta un ingreso y devuelve el id nuevo (id_cargo queda en NULL: ingreso sin cargo asociado)
async function guardarIngreso(data) {
    let sql = 'INSERT INTO ingreso (id_departamento, id_tipo_ingreso, id_cargo, id_usuario, concepto, monto, fecha, metodo_pago, estado) ' +
        'VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8) RETURNING id_ingreso';
    let params = [data.id_departamento, data.id_tipo_ingreso, ID_USUARIO, data.concepto, data.monto, data.fecha, data.metodo_pago, data.estado];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Actualiza los datos de un ingreso
async function actualizarIngreso(data) {
    let sql = 'UPDATE ingreso SET id_departamento = $1, id_tipo_ingreso = $2, concepto = $3, monto = $4, fecha = $5, ' +
        'metodo_pago = $6, estado = $7 WHERE id_ingreso = $8';
    let params = [data.id_departamento, data.id_tipo_ingreso, data.concepto, data.monto, data.fecha, data.metodo_pago, data.estado, data.id_ingreso];
    await db.query(sql, params);
}

// Elimina un ingreso
async function eliminarIngreso(data) {
    let sql = 'DELETE FROM ingreso WHERE id_ingreso = $1';
    let params = [data.id_ingreso];
    await db.query(sql, params);
}

module.exports = {
    obtenerIngresos,
    obtenerIngreso,
    guardarIngreso,
    actualizarIngreso,
    eliminarIngreso
};
