// Aplicación de pagos a cargos (tabla ingreso_cargo).
// Regla del negocio: el dinero de un departamento cubre primero sus deudas más antiguas (FIFO).
// Así funcionan los pagos parciales (un cargo queda con saldo) y los adelantados (un pago cubre
// varios meses). Lo que sobra queda como saldo a favor y se usa solo cuando se emiten nuevos cargos.
//
// Las aplicaciones del departamento se recalculan completas cada vez que cambia un pago o un cargo:
// siempre cuadran con los datos vigentes y no hay que corregir casos sueltos.
// Debe llamarse dentro de una transacción (t).

// Se trabaja en centavos para evitar errores de redondeo con decimales
const centavos = (valor) => Math.round(Number(valor) * 100);

async function reaplicar(t, idDepartamento) {
    await t.none('DELETE FROM ingreso_cargo ic USING ingreso i '
        + 'WHERE ic.id_ingreso = i.id_ingreso AND i.id_departamento = $1', [idDepartamento]);

    let pagos = await t.any("SELECT id_ingreso, monto FROM ingreso WHERE id_departamento = $1 "
        + "AND estado = 'registrado' AND aplica_deuda ORDER BY fecha, id_ingreso", [idDepartamento]);
    let cargos = await t.any('SELECT id_cargo, monto FROM cargo WHERE id_departamento = $1 '
        + 'ORDER BY periodo, vencimiento, id_cargo', [idDepartamento]);

    let indice = 0;
    let saldoCargo = cargos.length > 0 ? centavos(cargos[0].monto) : 0;

    for (let pago of pagos) {
        let disponible = centavos(pago.monto);
        while (disponible > 0 && indice < cargos.length) {
            let aplicado = Math.min(disponible, saldoCargo);
            await t.none('INSERT INTO ingreso_cargo (id_ingreso, id_cargo, monto) VALUES ($1, $2, $3)',
                [pago.id_ingreso, cargos[indice].id_cargo, aplicado / 100]);
            disponible -= aplicado;
            saldoCargo -= aplicado;
            if (saldoCargo === 0) {
                indice++;
                saldoCargo = indice < cargos.length ? centavos(cargos[indice].monto) : 0;
            }
        }
    }
}

module.exports = { reaplicar };
