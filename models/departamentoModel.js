const dao = require('./dao');
const objDao = new dao();

// Un solo condominio por instalación
const ID_CONDOMINIO = 1;

class departamentoModel {
    constructor() { }

    // Devuelve los departamentos y los tipos para llenar el combo
    ObtenerDepartamentos() {
        let sqlDepartamentos = 'SELECT d.*, t.nombre AS tipo_departamento FROM departamento d '
            + 'JOIN tipo_departamento t ON d.id_tipo_departamento = t.id_tipo_departamento '
            + 'WHERE d.id_condominio = $1 ORDER BY d.id_departamento';
        let sqlTipos = 'SELECT * FROM tipo_departamento ORDER BY id_tipo_departamento';
        return Promise.all([
            objDao.consultar(sqlDepartamentos, [ID_CONDOMINIO]),
            objDao.consultar(sqlTipos)
        ]).then(function (data) {
            return { Departamentos: data[0], Tipos: data[1] };
        });
    }

    GuardarDepartamento(data) {
        let sql = 'INSERT INTO departamento (id_condominio, numero, piso, estado, id_tipo_departamento, metros_cuadrados) '
            + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_departamento';
        let params = [ID_CONDOMINIO, data.numero, data.piso, data.estado,
            data.id_tipo_departamento, data.metros_cuadrados];
        return objDao.insertar(sql, params);
    }

    ActualizarDepartamento(data) {
        let sql = 'UPDATE departamento SET numero = $1, piso = $2, estado = $3, '
            + 'id_tipo_departamento = $4, metros_cuadrados = $5 WHERE id_departamento = $6';
        let params = [data.numero, data.piso, data.estado, data.id_tipo_departamento,
            data.metros_cuadrados, data.id_departamento];
        return objDao.ejecutar(sql, params);
    }

    EliminarDepartamento(data) {
        let sql = 'DELETE FROM departamento WHERE id_departamento = $1';
        let params = [data.id_departamento];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = departamentoModel;
