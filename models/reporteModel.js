const dao = require('./dao');
const cajaModel = require('./cajaModel');
const { rangoDelMes } = require('../utils/periodo');
const objDao = new dao();
const objCajaModel = new cajaModel();

// Movimientos registrados (no anulados) del condominio ($1) dentro del mes ($2 <= fecha < $3)
const DEL_MES = "estado = 'registrado' AND id_condominio = $1 AND fecha >= $2 AND fecha < $3";

const SQL_INGRESOS = 'SELECT t.nombre AS tipo, COUNT(*)::int AS cantidad, SUM(i.monto) AS monto FROM ingreso i '
    + 'JOIN tipo_ingreso t ON t.id_tipo_ingreso = i.id_tipo_ingreso WHERE ' + DEL_MES + ' GROUP BY t.nombre ORDER BY monto DESC';

const SQL_EGRESOS = "SELECT e.id_egreso, e.numero, TO_CHAR(e.fecha, 'YYYY-MM-DD') AS fecha, e.concepto, t.nombre AS tipo, e.proveedor, "
    + 'e.numero_documento, e.metodo_pago, e.monto FROM egreso e '
    + 'JOIN tipo_egreso t ON t.id_tipo_egreso = e.id_tipo_egreso WHERE ' + DEL_MES + ' ORDER BY e.fecha, e.numero';

// Cobranza de los cargos emitidos para ese mes ($2 = primer día del mes)
const SQL_COBRANZA = 'SELECT COUNT(*)::int AS cargos, COALESCE(SUM(c.monto), 0) AS emitido, COALESCE(SUM(c.pagado), 0) AS cobrado, '
    + 'COALESCE(SUM(c.saldo), 0) AS pendiente FROM v_cargo c JOIN departamento d ON d.id_departamento = c.id_departamento '
    + 'WHERE d.id_condominio = $1 AND c.periodo = $2';

// Departamentos con cargos vencidos hoy: cuánto deben y desde qué mes
const SQL_MOROSOS = "SELECT v.id_departamento, v.numero, v.propietario, COUNT(*)::int AS cargos, SUM(c.saldo) AS deuda, "
    + "TO_CHAR(MIN(c.periodo), 'YYYY-MM') AS desde FROM v_cargo c "
    + 'JOIN v_departamento v ON v.id_departamento = c.id_departamento '
    + "WHERE v.id_condominio = $1 AND c.estado = 'vencido' "
    + 'GROUP BY v.id_departamento, v.numero, v.propietario ORDER BY deuda DESC, v.numero';

class reporteModel {
    constructor() { }

    // Rendición de cuentas de un mes ('YYYY-MM') del condominio: con cuánto empezó, qué entró,
    // qué salió, con cuánto terminó, cómo va la cobranza de ese mes y quiénes están en mora hoy.
    async ObtenerMensual(idCondominio, periodo) {
        let { desde, hasta } = rangoDelMes(periodo);
        let mes = [idCondominio, desde, hasta];
        let [condominio, saldoInicial, saldoFinal, ingresos, egresos, cobranza, morosos] = await Promise.all([
            objDao.obtenerUno('SELECT nombre, direccion, nit, telefono, correo FROM condominio WHERE id_condominio = $1', [idCondominio]),
            objCajaModel.ObtenerSaldosAntesDe(idCondominio, desde),
            objCajaModel.ObtenerSaldosAntesDe(idCondominio, hasta),
            objDao.consultar(SQL_INGRESOS, mes),
            objDao.consultar(SQL_EGRESOS, mes),
            objDao.obtenerUno(SQL_COBRANZA, [idCondominio, desde]),
            objDao.consultar(SQL_MOROSOS, [idCondominio])
        ]);
        return {
            Condominio: condominio, Periodo: periodo, SaldoInicial: saldoInicial, SaldoFinal: saldoFinal,
            Ingresos: ingresos, Egresos: egresos, Cobranza: cobranza, Morosos: morosos
        };
    }
}

module.exports = reporteModel;
