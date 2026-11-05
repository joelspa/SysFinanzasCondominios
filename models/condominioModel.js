const dao = require('./dao');
const { ID_CONDOMINIO } = require('./config');
const objDao = new dao();

const SQL_CONDOMINIO = 'SELECT id_condominio, nombre, direccion, nit, telefono, correo, dia_vencimiento '
    + 'FROM condominio WHERE id_condominio = $1';

class condominioModel {
    constructor() { }

    ObtenerCondominio() {
        return objDao.obtenerUno(SQL_CONDOMINIO, [ID_CONDOMINIO]);
    }

    ActualizarCondominio(data) {
        let sql = 'UPDATE condominio SET nombre = $1, direccion = $2, nit = $3, telefono = $4, correo = $5, '
            + 'dia_vencimiento = $6 WHERE id_condominio = $7';
        let params = [data.nombre, data.direccion, data.nit, data.telefono, data.correo, data.dia_vencimiento, ID_CONDOMINIO];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = condominioModel;
