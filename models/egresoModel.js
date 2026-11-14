const dao = require('./dao');
const objDao = new dao();

const SQL_EGRESOS = 'SELECT e.id_egreso, e.id_tipo_egreso, t.nombre AS tipo_egreso, e.concepto, e.proveedor, e.numero_documento, '
    + "e.monto, TO_CHAR(e.fecha, 'YYYY-MM-DD') AS fecha, e.metodo_pago, e.estado, e.observacion, e.motivo_anulacion "
    + 'FROM egreso e JOIN tipo_egreso t ON t.id_tipo_egreso = e.id_tipo_egreso ';

// Saldo en caja del condominio: todo lo cobrado menos todo lo gastado, y lo mismo solo del mes actual
// (solo movimientos registrados, sin anulados)
const MES_ACTUAL = "fecha >= DATE_TRUNC('month', CURRENT_DATE)";
const REGISTRADOS = "estado = 'registrado' AND id_condominio = $1";
const SQL_CAJA = 'SELECT (SELECT COALESCE(SUM(monto), 0) FROM ingreso WHERE ' + REGISTRADOS + ') AS ingresos, '
    + '(SELECT COALESCE(SUM(monto), 0) FROM egreso WHERE ' + REGISTRADOS + ') AS egresos, '
    + '(SELECT COALESCE(SUM(monto), 0) FROM ingreso WHERE ' + REGISTRADOS + ' AND ' + MES_ACTUAL + ') AS ingresos_mes, '
    + '(SELECT COALESCE(SUM(monto), 0) FROM egreso WHERE ' + REGISTRADOS + ' AND ' + MES_ACTUAL + ') AS egresos_mes';

// Todos los métodos reciben primero el condominio activo: cada condominio ve y cambia solo sus gastos
class egresoModel {
    constructor() { }

    // Devuelve los gastos, los tipos para el combo y el saldo en caja
    async ObtenerEgresos(idCondominio) {
        let [egresos, tipos, caja] = await Promise.all([
            objDao.consultar(SQL_EGRESOS + 'WHERE e.id_condominio = $1 ORDER BY e.fecha DESC, e.id_egreso DESC', [idCondominio]),
            objDao.consultar('SELECT id_tipo_egreso, nombre, descripcion FROM tipo_egreso ORDER BY id_tipo_egreso'),
            objDao.obtenerUno(SQL_CAJA, [idCondominio])
        ]);
        let saldo = Number(caja.ingresos) - Number(caja.egresos);
        return { Egresos: egresos, Tipos: tipos, Caja: { ...caja, saldo: saldo.toFixed(2) } };
    }

    // Datos para imprimir el comprobante de un gasto
    async ObtenerComprobante(idCondominio, idEgreso) {
        let [egreso, extra, condominio] = await Promise.all([
            objDao.obtenerUno(SQL_EGRESOS + 'WHERE e.id_egreso = $1 AND e.id_condominio = $2', [idEgreso, idCondominio]),
            objDao.obtenerUno('SELECT u.nombre AS usuario FROM egreso e JOIN usuario u ON u.id_usuario = e.id_usuario WHERE e.id_egreso = $1', [idEgreso]),
            objDao.obtenerUno('SELECT nombre, direccion, nit, telefono, correo FROM condominio WHERE id_condominio = $1', [idCondominio])
        ]);
        if (!egreso) {
            throw new Error('El gasto no existe');
        }
        return { Egreso: { ...egreso, ...extra }, Condominio: condominio };
    }

    GuardarEgreso(idCondominio, data) {
        let sql = 'INSERT INTO egreso (id_condominio, id_usuario, id_tipo_egreso, concepto, proveedor, numero_documento, '
            + 'monto, fecha, metodo_pago, observacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_egreso';
        let params = [idCondominio, data.id_usuario, data.id_tipo_egreso, data.concepto, data.proveedor, data.numero_documento,
            data.monto, data.fecha, data.metodo_pago, data.observacion];
        return objDao.insertar(sql, params);
    }

    // Solo se editan gastos registrados: uno anulado queda tal cual en el historial
    async ActualizarEgreso(idCondominio, data) {
        let sql = 'UPDATE egreso SET id_tipo_egreso = $1, concepto = $2, proveedor = $3, numero_documento = $4, monto = $5, '
            + 'fecha = $6, metodo_pago = $7, observacion = $8 '
            + "WHERE id_egreso = $9 AND id_condominio = $10 AND estado = 'registrado' RETURNING id_egreso";
        let params = [data.id_tipo_egreso, data.concepto, data.proveedor, data.numero_documento, data.monto,
            data.fecha, data.metodo_pago, data.observacion, data.id_egreso, idCondominio];
        let editado = await objDao.obtenerUno(sql, params);
        if (!editado) {
            throw new Error('Solo se pueden editar gastos registrados (no anulados)');
        }
    }

    // Los gastos no se eliminan, se anulan: quedan en el historial con su motivo
    async AnularEgreso(idCondominio, data) {
        let sql = "UPDATE egreso SET estado = 'anulado', motivo_anulacion = $2 "
            + "WHERE id_egreso = $1 AND id_condominio = $3 AND estado = 'registrado' RETURNING id_egreso";
        let anulado = await objDao.obtenerUno(sql, [data.id_egreso, data.motivo, idCondominio]);
        if (!anulado) {
            throw new Error('El gasto no existe o ya estaba anulado');
        }
    }
}

module.exports = egresoModel;
