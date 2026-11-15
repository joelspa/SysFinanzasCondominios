const dao = require('./dao');
const { calcularSaldos, origenDe } = require('../services/caja');
const objDao = new dao();

// Total de una tabla de movimientos del condominio ($1), contando solo los registrados (no anulados)
const total = (tabla, condicion = '') => '(SELECT COALESCE(SUM(monto), 0) FROM ' + tabla
    + " WHERE estado = 'registrado' AND id_condominio = $1" + condicion + ')';
const MES_ACTUAL = " AND fecha >= DATE_TRUNC('month', CURRENT_DATE)";
const EN_EFECTIVO = " AND metodo_pago = 'efectivo'";

// Totales con los que services/caja.js calcula el disponible, lo que hay en caja y lo que hay en el banco
const SQL_TOTALES = 'SELECT ' + total('ingreso') + ' AS ingresos, ' + total('egreso') + ' AS egresos, '
    + total('ingreso', MES_ACTUAL) + ' AS ingresos_mes, ' + total('egreso', MES_ACTUAL) + ' AS egresos_mes, '
    + total('ingreso', EN_EFECTIVO) + ' AS ingresos_efectivo, ' + total('egreso', EN_EFECTIVO) + ' AS egresos_efectivo, '
    + total('movimiento_caja', " AND sentido = 'caja_a_banco'") + ' AS depositado, '
    + total('movimiento_caja', " AND sentido = 'banco_a_caja'") + ' AS retirado';

const SQL_MOVIMIENTOS = "SELECT m.id_movimiento_caja, m.sentido, m.monto, TO_CHAR(m.fecha, 'YYYY-MM-DD') AS fecha, m.observacion, "
    + 'm.estado, m.motivo_anulacion, u.nombre AS usuario, ua.nombre AS anulado_por, '
    + "TO_CHAR(m.fecha_anulacion, 'YYYY-MM-DD') AS fecha_anulacion FROM movimiento_caja m "
    + 'JOIN usuario u ON u.id_usuario = m.id_usuario LEFT JOIN usuario ua ON ua.id_usuario = m.anulado_por ';

// Todos los métodos reciben primero el condominio activo: cada condominio tiene su caja y su banco
class cajaModel {
    constructor() { }

    // Saldos del condominio: disponible, en caja y en banco (también los usan Gastos y el panel)
    async ObtenerSaldos(idCondominio) {
        return calcularSaldos(await objDao.obtenerUno(SQL_TOTALES, [idCondominio]));
    }

    // Devuelve los saldos y los depósitos y retiros entre la caja y el banco
    async ObtenerCaja(idCondominio) {
        let [saldos, movimientos] = await Promise.all([
            this.ObtenerSaldos(idCondominio),
            objDao.consultar(SQL_MOVIMIENTOS + 'WHERE m.id_condominio = $1 ORDER BY m.fecha DESC, m.id_movimiento_caja DESC', [idCondominio])
        ]);
        return { Saldos: saldos, Movimientos: movimientos };
    }

    // Transacción: comprueba que el dinero esté en el lugar de donde se quiere sacar y registra el movimiento
    GuardarMovimiento(idCondominio, data) {
        let sql = 'INSERT INTO movimiento_caja (id_condominio, id_usuario, sentido, monto, fecha, observacion) '
            + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_movimiento_caja';
        return objDao.transaccion(async function (t) {
            let saldos = calcularSaldos(await t.one(SQL_TOTALES, [idCondominio]));
            let origen = origenDe(data.sentido, saldos);
            if (Number(data.monto) > origen.disponible) {
                throw new Error('No se puede mover Bs ' + Number(data.monto).toFixed(2) + ': en ' + origen.nombre
                    + ' solo hay Bs ' + origen.disponible.toFixed(2));
            }
            return t.one(sql, [idCondominio, data.id_usuario, data.sentido, data.monto, data.fecha, data.observacion]);
        });
    }

    // Los movimientos no se editan ni se eliminan, se anulan: quedan en el historial con el motivo, quién y cuándo
    async AnularMovimiento(idCondominio, data) {
        let sql = "UPDATE movimiento_caja SET estado = 'anulado', motivo_anulacion = $2, anulado_por = $3, fecha_anulacion = now() "
            + "WHERE id_movimiento_caja = $1 AND id_condominio = $4 AND estado = 'registrado' RETURNING id_movimiento_caja";
        let anulado = await objDao.obtenerUno(sql, [data.id_movimiento_caja, data.motivo, data.id_usuario, idCondominio]);
        if (!anulado) {
            throw new Error('El movimiento no existe o ya estaba anulado');
        }
    }
}

module.exports = cajaModel;
