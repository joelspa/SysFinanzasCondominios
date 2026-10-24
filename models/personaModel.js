const db = require('./db');

// Lista todas las personas
async function obtenerPersonas() {
    let sql = 'SELECT * FROM persona ORDER BY nombre';
    let resultado = await db.query(sql);
    return resultado.rows;
}

// Busca una persona por su id
async function obtenerPersona(id_persona) {
    let sql = 'SELECT * FROM persona WHERE id_persona = $1';
    let params = [id_persona];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Inserta una persona y devuelve el id nuevo
async function guardarPersona(data) {
    let sql = 'INSERT INTO persona (nombre, telefono, correo) VALUES ($1, $2, $3) RETURNING id_persona';
    let params = [data.nombre, data.telefono, data.correo];
    let resultado = await db.query(sql, params);
    return resultado.rows[0];
}

// Actualiza los datos de una persona
async function actualizarPersona(data) {
    let sql = 'UPDATE persona SET nombre = $1, telefono = $2, correo = $3 WHERE id_persona = $4';
    let params = [data.nombre, data.telefono, data.correo, data.id_persona];
    await db.query(sql, params);
}

// Elimina una persona
async function eliminarPersona(data) {
    let sql = 'DELETE FROM persona WHERE id_persona = $1';
    let params = [data.id_persona];
    await db.query(sql, params);
}

module.exports = {
    obtenerPersonas,
    obtenerPersona,
    guardarPersona,
    actualizarPersona,
    eliminarPersona
};
