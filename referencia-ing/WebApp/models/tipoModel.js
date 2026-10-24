const dao = require('./dao');
const objDao = new dao();

class tipoModel {
    constructor() { }
    ObtenerTipos() {
        let sql = 'SELECT * FROM tipo ORDER BY 1';
        return objDao.consultar(sql);
    }

    GuardarTipo(data) {
        let sql = 'INSERT INTO tipo (Nombre, Descripcion) VALUES ($1, $2) RETURNING idTipo';
        let params = [data.nombre, data.descripcion];
        return objDao.insertar(sql, params);
    }

    ActualizarTipo(data) {
        let sql = 'UPDATE tipo SET Nombre = $1, Descripcion = $2 WHERE idTipo = $3';
        let params = [data.nombre, data.descripcion, data.idtipo];
        return objDao.ejecutar(sql, params);
    }

    EliminarTipo(data) {
        let sql = 'DELETE FROM tipo WHERE idTipo = $1';
        let params = [data.idtipo];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = tipoModel;
