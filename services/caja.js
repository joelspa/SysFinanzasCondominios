// Caja y banco: dónde está el dinero del condominio.
// Regla del negocio: lo que se cobra o se paga en efectivo entra o sale de la caja; lo que se mueve
// por transferencia, QR o tarjeta, del banco. Los depósitos y retiros (tabla movimiento_caja) pasan
// dinero de un lado al otro sin cambiar el total.

const SENTIDOS = ['caja_a_banco', 'banco_a_caja'];

// Recibe los totales de la consulta de saldos (models/cajaModel.js) y devuelve además:
//   saldo:    todo el dinero disponible (ingresos - gastos)
//   efectivo: lo que hay en la caja
//   banco:    lo que hay en el banco
function calcularSaldos(totales) {
    let saldo = Number(totales.ingresos) - Number(totales.egresos);
    let efectivo = Number(totales.ingresos_efectivo) - Number(totales.egresos_efectivo)
        - Number(totales.depositado) + Number(totales.retirado);
    return { ...totales, saldo: saldo.toFixed(2), efectivo: efectivo.toFixed(2), banco: (saldo - efectivo).toFixed(2) };
}

// De dónde sale el dinero de un movimiento y cuánto hay ahí
function origenDe(sentido, saldos) {
    return sentido === 'caja_a_banco'
        ? { nombre: 'la caja', disponible: Number(saldos.efectivo) }
        : { nombre: 'el banco', disponible: Number(saldos.banco) };
}

module.exports = { SENTIDOS, calcularSaldos, origenDe };
