const dao = require('./dao');
const traspasoModel = require('./traspasoModel');
const { validarTipoDepartamento } = require('../services/condominio');
const objDao = new dao();
const objTraspasoModel = new traspasoModel();

// con_historial: tiene residentes, cargos, pagos o traspasos registrados (no se puede eliminar)
const SQL_HISTORIAL = 'EXISTS (SELECT 1 FROM residente r WHERE r.id_departamento = v.id_departamento) '
    + 'OR EXISTS (SELECT 1 FROM cargo c WHERE c.id_departamento = v.id_departamento) '
    + 'OR EXISTS (SELECT 1 FROM ingreso i WHERE i.id_departamento = v.id_departamento) '
    + 'OR EXISTS (SELECT 1 FROM traspaso tr WHERE tr.id_departamento = v.id_departamento)';

const SQL_DEPARTAMENTOS = 'SELECT id_departamento, numero, piso, estado, id_tipo_departamento, metros_cuadrados, '
    + 'tipo_departamento, cuota_mensual, id_propietario, propietario, residentes_activos, deuda, saldo_favor, '
    + '(' + SQL_HISTORIAL + ') AS con_historial FROM v_departamento v ';

// Un departamento del condominio activo, o null si no existe o es de otro condominio
const SQL_UNO = SQL_DEPARTAMENTOS + 'WHERE id_departamento = $1 AND id_condominio = $2';

// Todos los métodos reciben primero el condominio activo: cada condominio ve y cambia solo sus departamentos
class departamentoModel {
    constructor() { }

    // Devuelve los departamentos (con ocupación, propietario y deuda) y los tipos del condominio para llenar el combo
    ObtenerDepartamentos(idCondominio) {
        let sqlTipos = 'SELECT * FROM tipo_departamento WHERE id_condominio = $1 ORDER BY id_tipo_departamento';
        return Promise.all([
            objDao.consultar(SQL_DEPARTAMENTOS + 'WHERE id_condominio = $1 ORDER BY numero', [idCondominio]),
            objDao.consultar(sqlTipos, [idCondominio])
        ]).then(function (data) {
            return { Departamentos: data[0], Tipos: data[1] };
        });
    }

    // Ficha del departamento: estado de cuenta, pagos, residentes e historial de propietarios
    async ObtenerFicha(idCondominio, idDepartamento) {
        let departamento = await objDao.obtenerUno(SQL_UNO, [idDepartamento, idCondominio]);
        if (!departamento) {
            throw new Error('El departamento no existe');
        }
        let sqlCargos = "SELECT c.id_cargo, c.concepto, TO_CHAR(c.periodo, 'YYYY-MM') AS periodo, "
            + "TO_CHAR(c.vencimiento, 'YYYY-MM-DD') AS vencimiento, c.monto, c.pagado, c.saldo, c.estado, "
            + 'c.id_responsable, p.nombre AS responsable FROM v_cargo c LEFT JOIN persona p ON p.id_persona = c.id_responsable '
            + 'WHERE c.id_departamento = $1 ORDER BY c.periodo DESC, c.id_cargo DESC';
        let sqlPagos = "SELECT i.id_ingreso, TO_CHAR(i.fecha, 'YYYY-MM-DD') AS fecha, i.concepto, i.monto, i.aplicado, i.a_favor, "
            + 'i.metodo_pago, i.estado, i.aplica_deuda, t.nombre AS tipo_ingreso FROM v_ingreso i '
            + 'JOIN tipo_ingreso t ON t.id_tipo_ingreso = i.id_tipo_ingreso WHERE i.id_departamento = $1 '
            + 'ORDER BY i.fecha DESC, i.id_ingreso DESC';
        let sqlResidentes = "SELECT r.id_residente, r.tipo_relacion, TO_CHAR(r.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio, "
            + "TO_CHAR(r.fecha_fin, 'YYYY-MM-DD') AS fecha_fin, r.estado, p.nombre AS persona FROM residente r "
            + 'JOIN persona p ON p.id_persona = r.id_persona WHERE r.id_departamento = $1 ORDER BY r.estado, r.fecha_inicio DESC';

        let [cargos, pagos, residentes, traspasos] = await Promise.all([
            objDao.consultar(sqlCargos, [idDepartamento]),
            objDao.consultar(sqlPagos, [idDepartamento]),
            objDao.consultar(sqlResidentes, [idDepartamento]),
            objTraspasoModel.ObtenerPorDepartamento(idDepartamento)
        ]);
        return { Departamento: departamento, Cargos: cargos, Pagos: pagos, Residentes: residentes, Traspasos: traspasos };
    }

    async GuardarDepartamento(idCondominio, data) {
        await validarTipoDepartamento(idCondominio, data.id_tipo_departamento);
        let sql = 'INSERT INTO departamento (id_condominio, numero, piso, estado, id_tipo_departamento, metros_cuadrados) '
            + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_departamento';
        let params = [idCondominio, data.numero, data.piso, data.estado,
            data.id_tipo_departamento, data.metros_cuadrados];
        return objDao.insertar(sql, params);
    }

    async ActualizarDepartamento(idCondominio, data) {
        await validarTipoDepartamento(idCondominio, data.id_tipo_departamento);
        let sql = 'UPDATE departamento SET numero = $1, piso = $2, estado = $3, '
            + 'id_tipo_departamento = $4, metros_cuadrados = $5 WHERE id_departamento = $6 AND id_condominio = $7';
        let params = [data.numero, data.piso, data.estado, data.id_tipo_departamento,
            data.metros_cuadrados, data.id_departamento, idCondominio];
        return objDao.ejecutar(sql, params);
    }

    // Un departamento con historial no se elimina: se marca como inactivo
    async EliminarDepartamento(idCondominio, data) {
        let departamento = await objDao.obtenerUno(SQL_UNO, [data.id_departamento, idCondominio]);
        if (departamento && departamento.con_historial) {
            throw new Error('No se puede eliminar: el departamento tiene residentes, cargos, pagos o traspasos registrados. Si ya no se usa, márquelo como inactivo');
        }
        let sql = 'DELETE FROM departamento WHERE id_departamento = $1 AND id_condominio = $2';
        return objDao.ejecutar(sql, [data.id_departamento, idCondominio]);
    }
}

module.exports = departamentoModel;
