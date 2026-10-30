const dao = require('./dao');
const objDao = new dao();

class personaModel {
    constructor() { }

    ObtenerPersonas() {
        let sql = 'SELECT * FROM persona ORDER BY id_persona';
        return objDao.consultar(sql);
    }

    GuardarPersona(data) {
        let sql = 'INSERT INTO persona (nombre, telefono, correo) VALUES ($1, $2, $3) RETURNING id_persona';
        let params = [data.nombre, data.telefono, data.correo];
        return objDao.insertar(sql, params);
    }

    ActualizarPersona(data) {
        let sql = 'UPDATE persona SET nombre = $1, telefono = $2, correo = $3 WHERE id_persona = $4';
        let params = [data.nombre, data.telefono, data.correo, data.id_persona];
        return objDao.ejecutar(sql, params);
    }

    EliminarPersona(data) {
        let sql = 'DELETE FROM persona WHERE id_persona = $1';
        let params = [data.id_persona];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = personaModel;
