const dao = require('./dao');
const { aplicar } = require('../services/aplicarPagos');
const { adelantarExpensas } = require('../services/expensas');
const { validarDepartamento } = require('../services/condominio');
const { siguienteNumero } = require('../services/correlativo');
const { CONCEPTO_EXPENSAS } = require('../config/config');
const objDao = new dao();

// Cargos que cubre cada pago, como lista JSON: [{ id_cargo, concepto, periodo, monto, total }]
const SQL_APLICACIONES = "(SELECT JSON_AGG(JSON_BUILD_OBJECT('id_cargo', c.id_cargo, 'concepto', c.concepto, "
    + "'periodo', TO_CHAR(c.periodo, 'YYYY-MM'), 'monto', ic.monto, 'total', c.monto) ORDER BY c.periodo, c.id_cargo) "
    + 'FROM ingreso_cargo ic JOIN cargo c ON c.id_cargo = ic.id_cargo WHERE ic.id_ingreso = i.id_ingreso) AS aplicaciones';

// LEFT JOIN: un ingreso del condominio (alquiler del salón a un tercero) no tiene departamento
const SQL_INGRESOS = 'SELECT i.id_ingreso, i.numero, i.id_departamento, i.id_tipo_ingreso, i.concepto, i.monto, i.aplicado, i.a_favor, '
    + "TO_CHAR(i.fecha, 'YYYY-MM-DD') AS fecha, i.metodo_pago, i.referencia, i.pagador, i.pagador_documento, "
    + 'i.estado, i.aplica_deuda, i.motivo_anulacion, ua.nombre AS anulado_por, '
    + "TO_CHAR(i.fecha_anulacion, 'YYYY-MM-DD') AS fecha_anulacion, "
    + 'd.numero AS departamento, t.nombre AS tipo_ingreso, ' + SQL_APLICACIONES + ' FROM v_ingreso i '
    + 'LEFT JOIN departamento d ON d.id_departamento = i.id_departamento '
    + 'LEFT JOIN usuario ua ON ua.id_usuario = i.anulado_por '
    + 'JOIN tipo_ingreso t ON t.id_tipo_ingreso = i.id_tipo_ingreso ';

// Todos los métodos reciben primero el condominio activo: cada condominio ve y cambia solo sus ingresos
class ingresoModel {
    constructor() { }

    // Devuelve los ingresos, los departamentos con su cuenta (y los datos del propietario para proponer
    // quién paga), los tipos y los cargos con saldo (para mostrar cómo se aplicará el pago)
    ObtenerIngresos(idCondominio) {
        let sqlDepartamentos = 'SELECT v.id_departamento, v.numero, v.estado, v.cuota_mensual, v.propietario, v.deuda, v.saldo_favor, '
            + '(SELECT p.documento FROM persona p WHERE p.id_persona = v.id_propietario) AS documento_propietario, '
            + "(SELECT TO_CHAR(MAX(c.periodo), 'YYYY-MM') FROM cargo c WHERE c.id_departamento = v.id_departamento "
            + 'AND c.concepto = $2) AS ultima_expensa FROM v_departamento v WHERE v.id_condominio = $1 ORDER BY v.numero';
        let sqlTipos = 'SELECT id_tipo_ingreso, nombre FROM tipo_ingreso ORDER BY id_tipo_ingreso';
        let sqlPendientes = "SELECT c.id_cargo, c.id_departamento, c.concepto, TO_CHAR(c.periodo, 'YYYY-MM') AS periodo, c.monto, c.saldo, c.estado "
            + 'FROM v_cargo c JOIN departamento d ON d.id_departamento = c.id_departamento '
            + 'WHERE c.saldo > 0 AND d.id_condominio = $1 ORDER BY c.periodo, c.vencimiento, c.id_cargo';
        return Promise.all([
            objDao.consultar(SQL_INGRESOS + 'WHERE i.id_condominio = $1 ORDER BY i.fecha DESC, i.id_ingreso DESC', [idCondominio]),
            objDao.consultar(sqlDepartamentos, [idCondominio, CONCEPTO_EXPENSAS]),
            objDao.consultar(sqlTipos),
            objDao.consultar(sqlPendientes, [idCondominio])
        ]).then(function (data) {
            return { Ingresos: data[0], Departamentos: data[1], Tipos: data[2], Pendientes: data[3] };
        });
    }

    // Datos para imprimir el recibo de un pago
    async ObtenerComprobante(idCondominio, idIngreso) {
        let sqlExtra = 'SELECT u.nombre AS usuario, v.propietario, v.deuda, v.saldo_favor FROM ingreso i '
            + 'JOIN usuario u ON u.id_usuario = i.id_usuario '
            + 'LEFT JOIN v_departamento v ON v.id_departamento = i.id_departamento WHERE i.id_ingreso = $1';
        let [ingreso, extra, condominio] = await Promise.all([
            objDao.obtenerUno(SQL_INGRESOS + 'WHERE i.id_ingreso = $1 AND i.id_condominio = $2', [idIngreso, idCondominio]),
            objDao.obtenerUno(sqlExtra, [idIngreso]),
            objDao.obtenerUno('SELECT nombre, direccion, nit, telefono, correo FROM condominio WHERE id_condominio = $1', [idCondominio])
        ]);
        if (!ingreso) {
            throw new Error('El pago no existe');
        }
        return { Ingreso: { ...ingreso, ...extra }, Condominio: condominio };
    }

    // Transacción: registra el pago con el siguiente número de recibo del condominio (a nombre del
    // usuario que lo cobró). Si es de un departamento, emite las expensas adelantadas que pidió
    // y reparte el dinero entre sus cargos.
    async GuardarIngreso(idCondominio, data) {
        await validarDepartamento(idCondominio, data.id_departamento);
        let sql = 'INSERT INTO ingreso (id_condominio, numero, id_departamento, id_tipo_ingreso, id_usuario, concepto, monto, fecha, '
            + 'metodo_pago, aplica_deuda, pagador, pagador_documento, referencia) '
            + 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id_ingreso';
        return objDao.transaccion(async function (t) {
            let numero = await siguienteNumero(t, 'ingreso', idCondominio);
            let nuevo = await t.one(sql, [idCondominio, numero, data.id_departamento, data.id_tipo_ingreso, data.id_usuario,
                data.concepto, data.monto, data.fecha, data.metodo_pago, data.aplica_deuda,
                data.pagador, data.pagador_documento, data.referencia]);
            if (data.id_departamento) {
                if (data.meses_adelantados > 0) {
                    await adelantarExpensas(t, idCondominio, data.id_departamento, data.meses_adelantados);
                }
                await aplicar(t, data.id_departamento);
            }
            return nuevo;
        });
    }

    // Un recibo emitido no cambia de monto, fecha ni departamento: si hubo un error se anula y se
    // registra otro. Solo se corrigen los datos que no mueven dinero.
    async ActualizarIngreso(idCondominio, data) {
        let sql = 'UPDATE ingreso SET id_tipo_ingreso = $1, concepto = $2, metodo_pago = $3, pagador = $4, pagador_documento = $5, '
            + "referencia = $6 WHERE id_ingreso = $7 AND id_condominio = $8 AND estado = 'registrado' RETURNING id_ingreso";
        let params = [data.id_tipo_ingreso, data.concepto, data.metodo_pago, data.pagador, data.pagador_documento,
            data.referencia, data.id_ingreso, idCondominio];
        let editado = await objDao.obtenerUno(sql, params);
        if (!editado) {
            throw new Error('Solo se pueden editar pagos registrados (no anulados)');
        }
    }

    // Los pagos no se eliminan, se anulan: quedan en el historial con el motivo, quién lo anuló y cuándo.
    // Lo que cubría vuelve a quedar pendiente (y si el departamento tiene otro saldo a favor, lo cubre).
    AnularIngreso(idCondominio, data) {
        let sql = "UPDATE ingreso SET estado = 'anulado', motivo_anulacion = $2, anulado_por = $3, fecha_anulacion = now() "
            + "WHERE id_ingreso = $1 AND id_condominio = $4 AND estado = 'registrado' RETURNING id_departamento";
        return objDao.transaccion(async function (t) {
            let ingreso = await t.oneOrNone(sql, [data.id_ingreso, data.motivo, data.id_usuario, idCondominio]);
            if (!ingreso) {
                throw new Error('El pago no existe o ya estaba anulado');
            }
            await t.none('DELETE FROM ingreso_cargo WHERE id_ingreso = $1', [data.id_ingreso]);
            if (ingreso.id_departamento) {
                await aplicar(t, ingreso.id_departamento);
            }
        });
    }
}

module.exports = ingresoModel;
