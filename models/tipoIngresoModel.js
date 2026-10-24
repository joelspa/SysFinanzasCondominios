const db = require('./db');

// Lista todos los tipos de ingreso
async function obtenerTiposIngreso() {
    let sql = 'SELECT * FROM tipo_ingreso ORDER BY nombre';
    let resultado = await db.query(sql);
    return resultado.rows;
}

module.exports = {
    obtenerTiposIngreso
};
