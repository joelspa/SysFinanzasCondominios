const dao = require('./dao');
const objDao = new dao();

class clienteModel {
    constructor() { }

    ObtenerClientes() {
        let sql = 'SELECT idcliente, ci, nombres, apellidos, direccion, telefono, correo, '
            + 'FechaNacimiento AS fecnac FROM cliente ORDER BY idcliente';
        return objDao.consultar(sql);
    }

    GuardarCliente(data) {
        let sql = 'INSERT INTO Cliente (CI, Nombres, Apellidos, Direccion, Telefono, Correo, FechaNacimiento) '
            + 'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING idCliente';
        let params = [data.ci, data.nombres, data.apellidos, data.direccion,
            data.telefono, data.correo, data.fecnac];
        return objDao.insertar(sql, params);
    }

    ActualizarCliente(data) {
        let sql = 'UPDATE Cliente SET CI = $1, Nombres = $2, Apellidos = $3, '
            + 'Direccion = $4, Telefono = $5, Correo = $6, FechaNacimiento = $7 WHERE idCliente = $8';
        let params = [data.ci, data.nombres, data.apellidos, data.direccion,
            data.telefono, data.correo, data.fecnac, data.idcliente];
        return objDao.ejecutar(sql, params);
    }

    EliminarCliente(data) {
        let sql = 'DELETE FROM Cliente WHERE idCliente = $1';
        let params = [data.idcliente];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = clienteModel;
