const dao = require('./dao');
const { reaplicar } = require('../services/aplicarPagos');
const { generarExpensas } = require('../services/expensas');
const { validarDepartamento } = require('../services/condominio');
const objDao = new dao();

const SQL_CARGOS = "SELECT c.id_cargo, c.id_departamento, d.numero AS departamento, c.concepto, "
    + "TO_CHAR(c.periodo, 'YYYY-MM') AS periodo, TO_CHAR(c.vencimiento, 'YYYY-MM-DD') AS vencimiento, "
    + 'c.monto, c.pagado, c.saldo, c.estado, c.id_responsable, p.nombre AS responsable FROM v_cargo c '
    + 'JOIN departamento d ON d.id_departamento = c.id_departamento '
    + 'LEFT JOIN persona p ON p.id_persona = c.id_responsable ';

// Condición para que una consulta por id_cargo solo alcance los cargos del condominio ($N = id_condominio)
const delCondominio = (parametro) => 'id_departamento IN (SELECT id_departamento FROM departamento WHERE id_condominio = ' + parametro + ')';

// 'YYYY-MM' del formulario -> primer día del mes para la columna periodo
const fechaPeriodo = (periodo) => periodo ? periodo + '-01' : null;

// Todos los métodos reciben primero el condominio activo: cada condominio ve y cambia solo sus cargos
class cargoModel {
    constructor() { }

    // Devuelve los cargos con lo pagado y su saldo, los departamentos para el formulario
    // y el día de vencimiento configurado (para proponerlo al emitir)
    ObtenerCargos(idCondominio) {
        let sqlDepartamentos = 'SELECT id_departamento, numero, estado, cuota_mensual, propietario '
            + 'FROM v_departamento WHERE id_condominio = $1 ORDER BY numero';
        return Promise.all([
            objDao.consultar(SQL_CARGOS + 'WHERE d.id_condominio = $1 ORDER BY c.periodo DESC, d.numero, c.id_cargo', [idCondominio]),
            objDao.consultar(sqlDepartamentos, [idCondominio]),
            objDao.obtenerUno('SELECT dia_vencimiento FROM condominio WHERE id_condominio = $1', [idCondominio])
        ]).then(function (data) {
            return { Cargos: data[0], Departamentos: data[1], DiaVencimiento: data[2].dia_vencimiento };
        });
    }

    // Transacción: crea el cargo a nombre del propietario actual y le aplica el saldo a favor que hubiera
    async GuardarCargo(idCondominio, data) {
        await validarDepartamento(idCondominio, data.id_departamento);
        let sql = 'INSERT INTO cargo (id_departamento, id_responsable, concepto, periodo, monto, vencimiento) '
            + 'VALUES ($1, (SELECT id_propietario FROM v_departamento WHERE id_departamento = $1), $2, $3, $4, $5) '
            + 'RETURNING id_cargo';
        let params = [data.id_departamento, data.concepto, fechaPeriodo(data.periodo), data.monto, data.vencimiento];
        return objDao.transaccion(async function (t) {
            let nuevo = await t.one(sql, params);
            await reaplicar(t, data.id_departamento);
            return nuevo;
        });
    }

    // Transacción: actualiza el cargo (el departamento no cambia) y recalcula los pagos aplicados
    ActualizarCargo(idCondominio, data) {
        let sql = 'UPDATE cargo SET concepto = $1, periodo = $2, monto = $3, vencimiento = $4 '
            + 'WHERE id_cargo = $5 AND ' + delCondominio('$6') + ' RETURNING id_departamento';
        let params = [data.concepto, fechaPeriodo(data.periodo), data.monto, data.vencimiento, data.id_cargo, idCondominio];
        return objDao.transaccion(async function (t) {
            let cargo = await t.oneOrNone(sql, params);
            if (cargo) {
                await reaplicar(t, cargo.id_departamento);
            }
        });
    }

    // Un cargo con pagos no se elimina: quedaría dinero cobrado sin respaldo
    EliminarCargo(idCondominio, data) {
        let params = [data.id_cargo, idCondominio];
        return objDao.transaccion(async function (t) {
            let cargo = await t.oneOrNone('SELECT pagado FROM v_cargo WHERE id_cargo = $1 AND ' + delCondominio('$2'), params);
            if (cargo && Number(cargo.pagado) > 0) {
                throw new Error('No se puede eliminar un cargo que ya tiene pagos aplicados. Anule primero los pagos o modifique el monto');
            }
            await t.none('DELETE FROM cargo WHERE id_cargo = $1 AND ' + delCondominio('$2'), params);
        });
    }

    // Transacción: emite las expensas del mes y aplica el saldo a favor de cada departamento
    GenerarExpensas(idCondominio, data) {
        return objDao.transaccion(async function (t) {
            let creados = await generarExpensas(t, idCondominio, data.periodo, data.dia_vencimiento);
            for (let fila of creados) {
                await reaplicar(t, fila.id_departamento);
            }
            return { Creados: creados.length };
        });
    }
}

module.exports = cargoModel;
