const db = require('./db');

// Un solo condominio por instalación
const ID_CONDOMINIO = 1;
// Usuario que registra el egreso: por ahora fijo, después vendrá del login
const ID_USUARIO = 1;

// Lista todos los egresos del condominio con el nombre de su tipo
// (la fecha se devuelve como texto 'YYYY-MM-DD' para que no cambie por la zona horaria)
async function obtenerEgresos() {
    let sql = "SELECT e.id_egreso, e.concepto, e.monto, TO_CHAR(e.fecha, 'YYYY-MM-DD') AS fecha, " +
        'e.estado, e.metodo_pago, e.id_tipo_egreso, t.nombre AS tipo_egreso FROM egreso e ' +
        'INNER JOIN tipo_egreso t ON t.id_tipo_egreso = e.id_tipo_egreso ' +
        'WHERE e.id_condominio = $1 ORDER BY e.fecha DESC, e.id_egreso DESC';
    let params = [ID_CONDOMINIO];
    let resultado = await db.query(sql, params);
    return resultado.rows;
}

// Busca un egreso por su id
async function obtenerEgreso(id_egreso) {
    let sql = "SELECT id_egreso, concepto, monto, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, " +
        'estado, metodo_pago, id_tipo_egreso FROM egreso WHERE id_egreso = $1 AND id_condominio = $2';
    let params = [id_egreso, ID_CONDOMINIO];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Inserta un egreso y devuelve el id nuevo
async function guardarEgreso(data) {
    let sql = 'INSERT INTO egreso (id_condominio, id_usuario, concepto, monto, fecha, estado, id_tipo_egreso, metodo_pago) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_egreso';
    let params = [ID_CONDOMINIO, ID_USUARIO, data.concepto, data.monto, data.fecha, data.estado, data.id_tipo_egreso, data.metodo_pago];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Actualiza los datos de un egreso
async function actualizarEgreso(data) {
    let sql = 'UPDATE egreso SET concepto = $1, monto = $2, fecha = $3, estado = $4, id_tipo_egreso = $5, metodo_pago = $6 ' +
        'WHERE id_egreso = $7 AND id_condominio = $8';
    let params = [data.concepto, data.monto, data.fecha, data.estado, data.id_tipo_egreso, data.metodo_pago, data.id_egreso, ID_CONDOMINIO];
    await db.query(sql, params);
}

// Elimina un egreso
async function eliminarEgreso(data) {
    let sql = 'DELETE FROM egreso WHERE id_egreso = $1 AND id_condominio = $2';
    let params = [data.id_egreso, ID_CONDOMINIO];
    await db.query(sql, params);
}

module.exports = {
    obtenerEgresos,
    obtenerEgreso,
    guardarEgreso,
    actualizarEgreso,
    eliminarEgreso
};
