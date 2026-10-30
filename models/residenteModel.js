const dao = require('./dao');
const objDao = new dao();

class residenteModel {
    constructor() { }

    // Devuelve los residentes y los departamentos y personas para llenar los combos
    ObtenerResidentes() {
        let sqlResidentes = 'SELECT r.id_residente, r.id_departamento, r.id_persona, r.tipo_relacion, '
            + "TO_CHAR(r.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio, "
            + "TO_CHAR(r.fecha_fin, 'YYYY-MM-DD') AS fecha_fin, r.estado, "
            + 'd.numero AS departamento, p.nombre AS persona FROM residente r '
            + 'JOIN departamento d ON r.id_departamento = d.id_departamento '
            + 'JOIN persona p ON r.id_persona = p.id_persona ORDER BY r.id_residente';
        let sqlDepartamentos = 'SELECT id_departamento, numero FROM departamento ORDER BY numero';
        let sqlPersonas = 'SELECT id_persona, nombre FROM persona ORDER BY nombre';
        return Promise.all([
            objDao.consultar(sqlResidentes),
            objDao.consultar(sqlDepartamentos),
            objDao.consultar(sqlPersonas)
        ]).then(function (data) {
            return { Residentes: data[0], Departamentos: data[1], Personas: data[2] };
        });
    }

    GuardarResidente(data) {
        let sql = 'INSERT INTO residente (id_departamento, id_persona, tipo_relacion, fecha_inicio, fecha_fin, estado) '
            + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_residente';
        let params = [data.id_departamento, data.id_persona, data.tipo_relacion,
            data.fecha_inicio, data.fecha_fin, data.estado];
        return objDao.insertar(sql, params);
    }

    ActualizarResidente(data) {
        let sql = 'UPDATE residente SET id_departamento = $1, id_persona = $2, tipo_relacion = $3, '
            + 'fecha_inicio = $4, fecha_fin = $5, estado = $6 WHERE id_residente = $7';
        let params = [data.id_departamento, data.id_persona, data.tipo_relacion,
            data.fecha_inicio, data.fecha_fin, data.estado, data.id_residente];
        return objDao.ejecutar(sql, params);
    }

    EliminarResidente(data) {
        let sql = 'DELETE FROM residente WHERE id_residente = $1';
        let params = [data.id_residente];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = residenteModel;
