// Numeración de recibos: cada condominio lleva su propia serie de recibos de pago y otra de
// comprobantes de gasto (1, 2, 3...), sin saltos ni repetidos.
// Debe llamarse dentro de una transacción (t), antes de insertar el movimiento.

// Tablas que llevan número. El nombre de la tabla sale solo de aquí, nunca de lo que envía el usuario.
const TABLAS = ['ingreso', 'egreso'];

async function siguienteNumero(t, tabla, idCondominio) {
    if (!TABLAS.includes(tabla)) {
        throw new Error('La tabla ' + tabla + ' no lleva numeración');
    }
    // FOR UPDATE bloquea la fila del condominio hasta que termine la transacción: si dos personas
    // registran al mismo tiempo, la segunda espera a la primera y no toman el mismo número.
    await t.one('SELECT id_condominio FROM condominio WHERE id_condominio = $1 FOR UPDATE', [idCondominio]);
    let { numero } = await t.one('SELECT COALESCE(MAX(numero), 0) + 1 AS numero FROM ' + tabla + ' WHERE id_condominio = $1',
        [idCondominio]);
    return numero;
}

module.exports = { siguienteNumero };
