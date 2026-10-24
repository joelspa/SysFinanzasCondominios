const db = require('./db');

// Lista todos los tipos de egreso
async function obtenerTiposEgreso() {
    let sql = 'SELECT * FROM tipo_egreso ORDER BY nombre';
    let resultado = await db.query(sql);
    return resultado.rows;
}

module.exports = {
    obtenerTiposEgreso
};
