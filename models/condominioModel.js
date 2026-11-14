const dao = require('./dao');
const objDao = new dao();

const SQL_CONDOMINIO = 'SELECT id_condominio, nombre, direccion, nit, telefono, correo, dia_vencimiento '
    + 'FROM condominio WHERE id_condominio = $1';

// El administrador ve todos los condominios; el tesorero, solo los que tiene asignados
// ($1 = rol del usuario, $2 = id_usuario)
const SQL_PERMITIDO = "($1 = 'admin' OR EXISTS (SELECT 1 FROM usuario_condominio uc "
    + 'WHERE uc.id_usuario = $2 AND uc.id_condominio = c.id_condominio))';

// Movimientos registrados (no anulados) y cargos de cada condominio, para el resumen
const cargosDe = (condicion) => '(SELECT COALESCE(SUM(v.saldo), 0) FROM v_cargo v '
    + 'JOIN departamento d ON d.id_departamento = v.id_departamento WHERE d.id_condominio = c.id_condominio' + condicion + ')';
const SQL_RESUMEN = 'SELECT c.id_condominio, c.nombre, c.direccion, '
    + '(SELECT COUNT(*) FROM departamento d WHERE d.id_condominio = c.id_condominio)::int AS departamentos, '
    + "(SELECT COALESCE(SUM(monto), 0) FROM ingreso i WHERE i.id_condominio = c.id_condominio AND i.estado = 'registrado') AS ingresos, "
    + "(SELECT COALESCE(SUM(monto), 0) FROM egreso e WHERE e.id_condominio = c.id_condominio AND e.estado = 'registrado') AS egresos, "
    + cargosDe('') + ' AS por_cobrar, ' + cargosDe(" AND v.estado = 'vencido'") + ' AS en_mora, '
    // con_movimientos: ya tiene departamentos, pagos o gastos (no se puede eliminar)
    + '(EXISTS (SELECT 1 FROM departamento d WHERE d.id_condominio = c.id_condominio) '
    + 'OR EXISTS (SELECT 1 FROM ingreso i WHERE i.id_condominio = c.id_condominio) '
    + 'OR EXISTS (SELECT 1 FROM egreso e WHERE e.id_condominio = c.id_condominio)) AS con_movimientos '
    + 'FROM condominio c ';

class condominioModel {
    constructor() { }

    ObtenerCondominio(idCondominio) {
        return objDao.obtenerUno(SQL_CONDOMINIO, [idCondominio]);
    }

    // Condominios que puede usar el usuario (para el selector del menú y para validar el condominio activo)
    ObtenerPermitidos(usuario) {
        let sql = 'SELECT c.id_condominio, c.nombre FROM condominio c WHERE ' + SQL_PERMITIDO + ' ORDER BY c.nombre, c.id_condominio';
        return objDao.consultar(sql, [usuario.rol, usuario.id_usuario]);
    }

    // Resumen de cada condominio que puede ver el usuario: dinero disponible, por cobrar y en mora
    ObtenerResumen(usuario) {
        let sql = SQL_RESUMEN + 'WHERE ' + SQL_PERMITIDO + ' ORDER BY c.nombre, c.id_condominio';
        return objDao.consultar(sql, [usuario.rol, usuario.id_usuario]);
    }

    // Transacción: crea el condominio y, si se pidió, copia los tipos de departamento (con sus cuotas)
    // de otro condominio para no tener que escribirlos de nuevo
    GuardarCondominio(data) {
        let sql = 'INSERT INTO condominio (nombre, direccion, dia_vencimiento) VALUES ($1, $2, $3) RETURNING id_condominio';
        let sqlCopiar = 'INSERT INTO tipo_departamento (id_condominio, nombre, descripcion, cuota_mensual) '
            + 'SELECT $1, nombre, descripcion, cuota_mensual FROM tipo_departamento WHERE id_condominio = $2';
        return objDao.transaccion(async function (t) {
            let nuevo = await t.one(sql, [data.nombre, data.direccion, data.dia_vencimiento]);
            if (data.copiar_tipos_de) {
                await t.none(sqlCopiar, [nuevo.id_condominio, data.copiar_tipos_de]);
            }
            return nuevo;
        });
    }

    ActualizarCondominio(idCondominio, data) {
        let sql = 'UPDATE condominio SET nombre = $1, direccion = $2, nit = $3, telefono = $4, correo = $5, '
            + 'dia_vencimiento = $6 WHERE id_condominio = $7';
        let params = [data.nombre, data.direccion, data.nit, data.telefono, data.correo, data.dia_vencimiento, idCondominio];
        return objDao.ejecutar(sql, params);
    }

    // Solo se elimina un condominio vacío (sin departamentos, pagos ni gastos) y nunca el último.
    // Sus tipos de departamento se van con él; los accesos de tesoreros se borran solos (ON DELETE CASCADE).
    EliminarCondominio(idCondominio) {
        return objDao.transaccion(async function (t) {
            let condominio = await t.oneOrNone(SQL_RESUMEN + 'WHERE c.id_condominio = $1', [idCondominio]);
            if (!condominio) {
                return;
            }
            if (condominio.con_movimientos) {
                throw new Error('No se puede eliminar: el condominio ya tiene departamentos, pagos o gastos registrados');
            }
            let { total } = await t.one('SELECT COUNT(*)::int AS total FROM condominio');
            if (total === 1) {
                throw new Error('Debe quedar al menos un condominio en el sistema');
            }
            await t.none('DELETE FROM tipo_departamento WHERE id_condominio = $1', [idCondominio]);
            await t.none('DELETE FROM condominio WHERE id_condominio = $1', [idCondominio]);
        });
    }
}

module.exports = condominioModel;
