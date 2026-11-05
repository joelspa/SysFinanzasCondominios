const dao = require('./dao');
const objDao = new dao();

// Un propietario activo no tiene fecha de salida: deja de serlo solo con un traspaso de propiedad,
// que es el que registra esa fecha. Inquilinos y familiares sí pueden tenerla (opcional).
function fechaSalida(data) {
    return (data.tipo_relacion === 'propietario' && data.estado === 'activo') ? null : data.fecha_fin;
}

// Reglas antes de guardar un residente activo:
// - la misma persona no puede estar dos veces activa en el mismo departamento
// - un segundo propietario activo solo se acepta si se confirma que son copropietarios;
//   si fue una venta corresponde un traspaso de propiedad (deja el historial)
async function validarAsignacion(data) {
    if (data.estado !== 'activo') {
        return;
    }
    let sql = 'SELECT r.id_persona, r.tipo_relacion, p.nombre FROM residente r JOIN persona p ON p.id_persona = r.id_persona '
        + "WHERE r.id_departamento = $1 AND r.estado = 'activo' AND r.id_residente <> $2";
    let otros = await objDao.consultar(sql, [data.id_departamento, data.id_residente || 0]);

    if (otros.some((o) => o.id_persona == data.id_persona)) {
        throw new Error('Esa persona ya está registrada como residente activo de este departamento');
    }
    let propietarios = otros.filter((o) => o.tipo_relacion === 'propietario');
    if (data.tipo_relacion === 'propietario' && propietarios.length > 0 && !data.confirmar_copropiedad) {
        throw new Error('El departamento ya tiene como propietario a ' + propietarios.map((p) => p.nombre).join(' y ')
            + '. Si fue una venta use «Traspaso de propiedad»; si son copropietarios, confírmelo en el formulario');
    }
}

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

    async GuardarResidente(data) {
        await validarAsignacion(data);
        let sql = 'INSERT INTO residente (id_departamento, id_persona, tipo_relacion, fecha_inicio, fecha_fin, estado) '
            + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_residente';
        let params = [data.id_departamento, data.id_persona, data.tipo_relacion,
            data.fecha_inicio, fechaSalida(data), data.estado];
        return objDao.insertar(sql, params);
    }

    async ActualizarResidente(data) {
        await validarAsignacion(data);
        let sql = 'UPDATE residente SET id_departamento = $1, id_persona = $2, tipo_relacion = $3, '
            + 'fecha_inicio = $4, fecha_fin = $5, estado = $6 WHERE id_residente = $7';
        let params = [data.id_departamento, data.id_persona, data.tipo_relacion,
            data.fecha_inicio, fechaSalida(data), data.estado, data.id_residente];
        return objDao.ejecutar(sql, params);
    }

    EliminarResidente(data) {
        let sql = 'DELETE FROM residente WHERE id_residente = $1';
        let params = [data.id_residente];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = residenteModel;
