const dao = require('./dao');
const { ID_CONDOMINIO } = require('./config');
const objDao = new dao();

const SQL_TRASPASOS = "SELECT tr.id_traspaso, tr.id_departamento, d.numero AS departamento, TO_CHAR(tr.fecha, 'YYYY-MM-DD') AS fecha, "
    + 'tr.deuda_pendiente, tr.observacion, pa.nombre AS propietario_anterior, pn.nombre AS propietario_nuevo FROM traspaso tr '
    + 'JOIN departamento d ON d.id_departamento = tr.id_departamento '
    + 'LEFT JOIN persona pa ON pa.id_persona = tr.id_propietario_anterior '
    + 'JOIN persona pn ON pn.id_persona = tr.id_propietario_nuevo ';

class traspasoModel {
    constructor() { }

    // Devuelve el historial de traspasos y los departamentos y personas para el formulario
    ObtenerTraspasos() {
        let sqlDepartamentos = 'SELECT id_departamento, numero, id_propietario, propietario, deuda '
            + 'FROM v_departamento WHERE id_condominio = $1 ORDER BY numero';
        return Promise.all([
            objDao.consultar(SQL_TRASPASOS + 'ORDER BY tr.fecha DESC, tr.id_traspaso DESC'),
            objDao.consultar(sqlDepartamentos, [ID_CONDOMINIO]),
            objDao.consultar('SELECT id_persona, nombre FROM persona ORDER BY nombre')
        ]).then(function (data) {
            return { Traspasos: data[0], Departamentos: data[1], Personas: data[2] };
        });
    }

    ObtenerPorDepartamento(idDepartamento) {
        return objDao.consultar(SQL_TRASPASOS + 'WHERE tr.id_departamento = $1 ORDER BY tr.fecha DESC, tr.id_traspaso DESC',
            [idDepartamento]);
    }

    // Transacción: cierra a los propietarios actuales, registra al nuevo y guarda el traspaso con la deuda
    // que tenía el departamento. Los cargos anteriores siguen a nombre de quien era responsable.
    RealizarTraspaso(data) {
        return objDao.transaccion(async function (t) {
            let anteriores = await t.any("SELECT id_residente, id_persona, TO_CHAR(fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio "
                + "FROM residente WHERE id_departamento = $1 AND tipo_relacion = 'propietario' AND estado = 'activo' "
                + 'ORDER BY fecha_inicio DESC, id_residente DESC', [data.id_departamento]);

            if (anteriores.some((a) => a.id_persona == data.id_propietario_nuevo)) {
                throw new Error('Esa persona ya es propietaria del departamento');
            }
            if (anteriores.some((a) => a.fecha_inicio > data.fecha)) {
                throw new Error('La fecha del traspaso no puede ser anterior al inicio del propietario actual');
            }

            let { deuda } = await t.one('SELECT COALESCE(SUM(saldo), 0) AS deuda FROM v_cargo WHERE id_departamento = $1',
                [data.id_departamento]);
            if (Number(deuda) > 0 && !data.confirmar_deuda) {
                throw new Error('El departamento tiene una deuda pendiente. Confirme el traspaso para continuar');
            }

            if (anteriores.length > 0) {
                await t.none("UPDATE residente SET estado = 'inactivo', fecha_fin = $2 WHERE id_residente = ANY($1::int[])",
                    [anteriores.map((a) => a.id_residente), data.fecha]);
            }
            await t.none("INSERT INTO residente (id_departamento, id_persona, tipo_relacion, fecha_inicio, estado) "
                + "VALUES ($1, $2, 'propietario', $3, 'activo')", [data.id_departamento, data.id_propietario_nuevo, data.fecha]);

            let sql = 'INSERT INTO traspaso (id_departamento, id_propietario_anterior, id_propietario_nuevo, fecha, deuda_pendiente, observacion) '
                + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_traspaso';
            return t.one(sql, [data.id_departamento, anteriores.length > 0 ? anteriores[0].id_persona : null,
                data.id_propietario_nuevo, data.fecha, deuda, data.observacion]);
        });
    }
}

module.exports = traspasoModel;
