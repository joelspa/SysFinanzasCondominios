const dao = require('./dao');
const objDao = new dao();

// Usuario que registra el ingreso: por ahora fijo, después vendrá del login
const ID_USUARIO = 1;

// Recalcula el estado de los cargos indicados: pagado si tiene un ingreso registrado,
// vencido si ya pasó la fecha de vencimiento y pendiente en otro caso
const SQL_ESTADO_CARGO = 'UPDATE cargo SET estado = CASE '
    + "WHEN EXISTS (SELECT 1 FROM ingreso i WHERE i.id_cargo = cargo.id_cargo AND i.estado = 'registrado') THEN 'pagado' "
    + "WHEN vencimiento < CURRENT_DATE THEN 'vencido' ELSE 'pendiente' END "
    + 'WHERE id_cargo = ANY($1::int[])';

async function actualizarCargos(t, cargos) {
    let ids = cargos.filter(id => id != null);
    if (ids.length > 0) {
        await t.none(SQL_ESTADO_CARGO, [ids]);
    }
}

class ingresoModel {
    constructor() { }

    // Devuelve los ingresos y los departamentos, tipos y cargos para llenar los combos
    ObtenerIngresos() {
        let sqlIngresos = 'SELECT i.id_ingreso, i.id_departamento, i.id_tipo_ingreso, i.id_cargo, i.concepto, i.monto, '
            + "TO_CHAR(i.fecha, 'YYYY-MM-DD') AS fecha, i.metodo_pago, i.estado, "
            + 'd.numero AS departamento, t.nombre AS tipo_ingreso FROM ingreso i '
            + 'JOIN departamento d ON i.id_departamento = d.id_departamento '
            + 'JOIN tipo_ingreso t ON i.id_tipo_ingreso = t.id_tipo_ingreso '
            + 'ORDER BY i.fecha DESC, i.id_ingreso DESC';
        let sqlDepartamentos = 'SELECT id_departamento, numero FROM departamento ORDER BY numero';
        let sqlTipos = 'SELECT id_tipo_ingreso, nombre FROM tipo_ingreso ORDER BY id_tipo_ingreso';
        let sqlCargos = "SELECT id_cargo, id_departamento, concepto, TO_CHAR(periodo, 'YYYY-MM') AS periodo, monto, estado "
            + 'FROM cargo ORDER BY periodo, id_cargo';
        return Promise.all([
            objDao.consultar(sqlIngresos),
            objDao.consultar(sqlDepartamentos),
            objDao.consultar(sqlTipos),
            objDao.consultar(sqlCargos)
        ]).then(function (data) {
            return { Ingresos: data[0], Departamentos: data[1], Tipos: data[2], Cargos: data[3] };
        });
    }

    // Transacción: registra el ingreso y marca como pagado el cargo que cancela
    GuardarIngreso(data) {
        let sql = 'INSERT INTO ingreso (id_departamento, id_tipo_ingreso, id_cargo, id_usuario, concepto, monto, fecha, metodo_pago, estado) '
            + 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_ingreso';
        let params = [data.id_departamento, data.id_tipo_ingreso, data.id_cargo, ID_USUARIO,
            data.concepto, data.monto, data.fecha, data.metodo_pago, data.estado];
        return objDao.transaccion(async function (t) {
            let nuevo = await t.one(sql, params);
            await actualizarCargos(t, [data.id_cargo]);
            return nuevo;
        });
    }

    // Transacción: actualiza el ingreso y recalcula el cargo anterior y el nuevo
    ActualizarIngreso(data) {
        let sqlAnterior = 'SELECT id_cargo FROM ingreso WHERE id_ingreso = $1';
        let sql = 'UPDATE ingreso SET id_departamento = $1, id_tipo_ingreso = $2, id_cargo = $3, concepto = $4, '
            + 'monto = $5, fecha = $6, metodo_pago = $7, estado = $8 WHERE id_ingreso = $9';
        let params = [data.id_departamento, data.id_tipo_ingreso, data.id_cargo, data.concepto,
            data.monto, data.fecha, data.metodo_pago, data.estado, data.id_ingreso];
        return objDao.transaccion(async function (t) {
            let anterior = await t.oneOrNone(sqlAnterior, [data.id_ingreso]);
            await t.none(sql, params);
            await actualizarCargos(t, [anterior && anterior.id_cargo, data.id_cargo]);
        });
    }

    // Transacción: elimina el ingreso y devuelve su cargo a pendiente
    EliminarIngreso(data) {
        let sql = 'DELETE FROM ingreso WHERE id_ingreso = $1 RETURNING id_cargo';
        return objDao.transaccion(async function (t) {
            let eliminado = await t.oneOrNone(sql, [data.id_ingreso]);
            await actualizarCargos(t, [eliminado && eliminado.id_cargo]);
        });
    }
}

module.exports = ingresoModel;
