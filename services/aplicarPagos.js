// Aplicación de pagos a cargos (tabla ingreso_cargo).
// Regla del negocio: el dinero de un departamento cubre primero sus deudas más antiguas (FIFO).
// Así funcionan los pagos parciales (un cargo queda con saldo) y los adelantados (un pago cubre
// varios meses). Lo que sobra queda como saldo a favor y se usa cuando se emiten nuevos cargos.
//
// Un recibo emitido no cambia: lo que ya se aplicó no se toca. Solo se reparte el dinero que
// todavía está disponible (pagos con saldo a favor) entre los cargos que todavía tienen saldo.
// Se llama después de registrar un pago, emitir o modificar un cargo, o anular un pago
// (lo que ese pago cubría vuelve a quedar pendiente y otro saldo a favor puede cubrirlo).
// Debe llamarse dentro de una transacción (t).

// Se trabaja en centavos para evitar errores de redondeo con decimales
const centavos = (valor) => Math.round(Number(valor) * 100);

// Si el pago ya cubría una parte de ese cargo, la nueva parte se suma a la misma fila
const SQL_APLICAR = 'INSERT INTO ingreso_cargo (id_ingreso, id_cargo, monto) VALUES ($1, $2, $3) '
    + 'ON CONFLICT (id_ingreso, id_cargo) DO UPDATE SET monto = ingreso_cargo.monto + EXCLUDED.monto';

async function aplicar(t, idDepartamento) {
    let pagos = await t.any('SELECT id_ingreso, a_favor FROM v_ingreso WHERE id_departamento = $1 AND a_favor > 0 '
        + 'ORDER BY fecha, id_ingreso', [idDepartamento]);
    let cargos = await t.any('SELECT id_cargo, saldo FROM v_cargo WHERE id_departamento = $1 AND saldo > 0 '
        + 'ORDER BY periodo, vencimiento, id_cargo', [idDepartamento]);

    let indice = 0;
    let saldoCargo = cargos.length > 0 ? centavos(cargos[0].saldo) : 0;

    for (let pago of pagos) {
        let disponible = centavos(pago.a_favor);
        while (disponible > 0 && indice < cargos.length) {
            let aplicado = Math.min(disponible, saldoCargo);
            await t.none(SQL_APLICAR, [pago.id_ingreso, cargos[indice].id_cargo, aplicado / 100]);
            disponible -= aplicado;
            saldoCargo -= aplicado;
            if (saldoCargo === 0) {
                indice++;
                saldoCargo = indice < cargos.length ? centavos(cargos[indice].saldo) : 0;
            }
        }
    }
}

module.exports = { aplicar };
