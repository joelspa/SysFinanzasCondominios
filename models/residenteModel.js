const dao = require('./dao');
const { validarDepartamento } = require('../services/condominio');
const objDao = new dao();

// Condición para que una consulta por id_residente solo alcance residentes del condominio ($N = id_condominio)
const delCondominio = (parametro) => 'id_departamento IN (SELECT id_departamento FROM departamento WHERE id_condominio = ' + parametro + ')';

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

// Todos los métodos reciben primero el condominio activo. Las personas son comunes a todos los
// condominios (alguien puede ser propietario en dos); los residentes son de los departamentos de cada uno.
class residenteModel {
    constructor() { }

    // Devuelve los residentes del condominio y sus departamentos y las personas para llenar los combos
    ObtenerResidentes(idCondominio) {
        let sqlResidentes = 'SELECT r.id_residente, r.id_departamento, r.id_persona, r.tipo_relacion, '
            + "TO_CHAR(r.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio, "
            + "TO_CHAR(r.fecha_fin, 'YYYY-MM-DD') AS fecha_fin, r.estado, "
            + 'd.numero AS departamento, p.nombre AS persona FROM residente r '
            + 'JOIN departamento d ON r.id_departamento = d.id_departamento '
            + 'JOIN persona p ON r.id_persona = p.id_persona WHERE d.id_condominio = $1 ORDER BY r.id_residente';
        let sqlDepartamentos = 'SELECT id_departamento, numero FROM departamento WHERE id_condominio = $1 ORDER BY numero';
        let sqlPersonas = 'SELECT id_persona, nombre FROM persona ORDER BY nombre';
        return Promise.all([
            objDao.consultar(sqlResidentes, [idCondominio]),
            objDao.consultar(sqlDepartamentos, [idCondominio]),
            objDao.consultar(sqlPersonas)
        ]).then(function (data) {
            return { Residentes: data[0], Departamentos: data[1], Personas: data[2] };
        });
    }

    async GuardarResidente(idCondominio, data) {
        await validarDepartamento(idCondominio, data.id_departamento);
        await validarAsignacion(data);
        let sql = 'INSERT INTO residente (id_departamento, id_persona, tipo_relacion, fecha_inicio, fecha_fin, estado) '
            + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_residente';
        let params = [data.id_departamento, data.id_persona, data.tipo_relacion,
            data.fecha_inicio, fechaSalida(data), data.estado];
        return objDao.insertar(sql, params);
    }

    async ActualizarResidente(idCondominio, data) {
        await validarDepartamento(idCondominio, data.id_departamento);
        await validarAsignacion(data);
        let sql = 'UPDATE residente SET id_departamento = $1, id_persona = $2, tipo_relacion = $3, '
            + 'fecha_inicio = $4, fecha_fin = $5, estado = $6 WHERE id_residente = $7 AND ' + delCondominio('$8');
        let params = [data.id_departamento, data.id_persona, data.tipo_relacion,
            data.fecha_inicio, fechaSalida(data), data.estado, data.id_residente, idCondominio];
        return objDao.ejecutar(sql, params);
    }

    EliminarResidente(idCondominio, data) {
        let sql = 'DELETE FROM residente WHERE id_residente = $1 AND ' + delCondominio('$2');
        let params = [data.id_residente, idCondominio];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = residenteModel;
