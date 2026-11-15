const dao = require('./dao');
const cajaModel = require('./cajaModel');
const { siguienteNumero } = require('../services/correlativo');
const objDao = new dao();
const objCajaModel = new cajaModel();

const SQL_EGRESOS = 'SELECT e.id_egreso, e.numero, e.id_tipo_egreso, t.nombre AS tipo_egreso, e.concepto, e.proveedor, e.numero_documento, '
    + "e.monto, TO_CHAR(e.fecha, 'YYYY-MM-DD') AS fecha, e.metodo_pago, e.estado, e.observacion, e.motivo_anulacion, "
    + "ua.nombre AS anulado_por, TO_CHAR(e.fecha_anulacion, 'YYYY-MM-DD') AS fecha_anulacion "
    + 'FROM egreso e JOIN tipo_egreso t ON t.id_tipo_egreso = e.id_tipo_egreso '
    + 'LEFT JOIN usuario ua ON ua.id_usuario = e.anulado_por ';

// Todos los métodos reciben primero el condominio activo: cada condominio ve y cambia solo sus gastos
class egresoModel {
    constructor() { }

    // Devuelve los gastos, los tipos para el combo y los saldos del condominio (disponible, en caja y en banco)
    async ObtenerEgresos(idCondominio) {
        let [egresos, tipos, caja] = await Promise.all([
            objDao.consultar(SQL_EGRESOS + 'WHERE e.id_condominio = $1 ORDER BY e.fecha DESC, e.id_egreso DESC', [idCondominio]),
            objDao.consultar('SELECT id_tipo_egreso, nombre, descripcion FROM tipo_egreso ORDER BY id_tipo_egreso'),
            objCajaModel.ObtenerSaldos(idCondominio)
        ]);
        return { Egresos: egresos, Tipos: tipos, Caja: caja };
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

    // Transacción: registra el gasto con el siguiente número de comprobante del condominio
    GuardarEgreso(idCondominio, data) {
        let sql = 'INSERT INTO egreso (id_condominio, numero, id_usuario, id_tipo_egreso, concepto, proveedor, numero_documento, '
            + 'monto, fecha, metodo_pago, observacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id_egreso';
        return objDao.transaccion(async function (t) {
            let numero = await siguienteNumero(t, 'egreso', idCondominio);
            return t.one(sql, [idCondominio, numero, data.id_usuario, data.id_tipo_egreso, data.concepto, data.proveedor,
                data.numero_documento, data.monto, data.fecha, data.metodo_pago, data.observacion]);
        });
    }

    // Un comprobante emitido no cambia de monto ni de fecha: si hubo un error se anula y se registra
    // otro. Solo se corrigen los datos que no mueven dinero, y solo en gastos no anulados.
    async ActualizarEgreso(idCondominio, data) {
        let sql = 'UPDATE egreso SET id_tipo_egreso = $1, concepto = $2, proveedor = $3, numero_documento = $4, '
            + 'metodo_pago = $5, observacion = $6 '
            + "WHERE id_egreso = $7 AND id_condominio = $8 AND estado = 'registrado' RETURNING id_egreso";
        let params = [data.id_tipo_egreso, data.concepto, data.proveedor, data.numero_documento,
            data.metodo_pago, data.observacion, data.id_egreso, idCondominio];
        let editado = await objDao.obtenerUno(sql, params);
        if (!editado) {
            throw new Error('Solo se pueden editar gastos registrados (no anulados)');
        }
    }

    // Los gastos no se eliminan, se anulan: quedan en el historial con el motivo, quién lo anuló y cuándo
    async AnularEgreso(idCondominio, data) {
        let sql = "UPDATE egreso SET estado = 'anulado', motivo_anulacion = $2, anulado_por = $3, fecha_anulacion = now() "
            + "WHERE id_egreso = $1 AND id_condominio = $4 AND estado = 'registrado' RETURNING id_egreso";
        let anulado = await objDao.obtenerUno(sql, [data.id_egreso, data.motivo, data.id_usuario, idCondominio]);
        if (!anulado) {
            throw new Error('El gasto no existe o ya estaba anulado');
        }
    }
}

module.exports = egresoModel;
