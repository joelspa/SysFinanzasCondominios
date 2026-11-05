const { ID_CONDOMINIO, CONCEPTO_EXPENSAS } = require('./config');

// Emisión de expensas (cargos mensuales). La cuota sale del tipo de departamento, el responsable
// es el propietario actual y el vencimiento es el día configurado en el condominio.
// Si el departamento ya tiene la expensa del período no se duplica.
// Deben llamarse dentro de una transacción (t).

const SQL_GENERAR = 'INSERT INTO cargo (id_departamento, id_responsable, concepto, periodo, monto, vencimiento) '
    + 'SELECT d.id_departamento, d.id_propietario, $1, $2::date, d.cuota_mensual, $3::date FROM v_departamento d '
    + "WHERE d.estado = 'activo' AND d.id_condominio = $4 AND ($5::int IS NULL OR d.id_departamento = $5) "
    + 'ON CONFLICT (id_departamento, periodo, concepto) DO NOTHING RETURNING id_departamento';

// '2026-11' + 3 meses -> '2027-02'
function sumarMeses(periodo, cantidad) {
    let [anio, mes] = periodo.split('-').map(Number);
    let total = anio * 12 + (mes - 1) + cantidad;
    return Math.floor(total / 12) + '-' + String(total % 12 + 1).padStart(2, '0');
}

// Emite la expensa del período ('YYYY-MM') para todos los departamentos activos o solo para uno.
// Devuelve los departamentos a los que se les creó.
function generarExpensas(t, periodo, diaVencimiento, idDepartamento = null) {
    let vencimiento = periodo + '-' + String(diaVencimiento).padStart(2, '0');
    return t.any(SQL_GENERAR, [CONCEPTO_EXPENSAS, periodo + '-01', vencimiento, ID_CONDOMINIO, idDepartamento]);
}

// Emite por adelantado las expensas de los próximos meses de un departamento, desde el mes actual
// o desde el mes siguiente a su última expensa (el que sea mayor)
async function adelantarExpensas(t, idDepartamento, meses) {
    let { inicio } = await t.one("SELECT TO_CHAR(GREATEST(MAX(periodo) + INTERVAL '1 month', "
        + "DATE_TRUNC('month', CURRENT_DATE)), 'YYYY-MM') AS inicio "
        + 'FROM cargo WHERE id_departamento = $1 AND concepto = $2', [idDepartamento, CONCEPTO_EXPENSAS]);
    let { dia_vencimiento } = await t.one('SELECT dia_vencimiento FROM condominio WHERE id_condominio = $1', [ID_CONDOMINIO]);

    let creados = 0;
    for (let i = 0; i < meses; i++) {
        let filas = await generarExpensas(t, sumarMeses(inicio, i), dia_vencimiento, idDepartamento);
        creados += filas.length;
    }
    if (creados === 0) {
        throw new Error('No se pudieron emitir las expensas adelantadas: el departamento está inactivo');
    }
}

module.exports = { generarExpensas, adelantarExpensas };
