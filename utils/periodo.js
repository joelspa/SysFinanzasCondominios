// Los meses se manejan como texto 'YYYY-MM' (un período).

// '2026-11' + 3 meses -> '2027-02'; con cantidad negativa retrocede
function sumarMeses(periodo, cantidad) {
    let [anio, mes] = periodo.split('-').map(Number);
    let total = anio * 12 + (mes - 1) + cantidad;
    return Math.floor(total / 12) + '-' + String(total % 12 + 1).padStart(2, '0');
}

// Primer día del período y primer día del siguiente: el mes es desde <= fecha < hasta
function rangoDelMes(periodo) {
    return { desde: periodo + '-01', hasta: sumarMeses(periodo, 1) + '-01' };
}

module.exports = { sumarMeses, rangoDelMes };
