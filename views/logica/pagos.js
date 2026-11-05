import { hoy, desplazarMes } from '../formato';

// Reglas de pagos en el navegador, para mostrar ANTES de guardar cómo quedará la cuenta.
// Siguen el mismo criterio que el servidor (models/aplicarPagos.js y models/expensas.js);
// el resultado final siempre lo calcula el servidor.

const centavos = (valor) => Math.round(Number(valor || 0) * 100);

// Períodos que se emitirán al adelantar meses: desde el mes actual o desde el mes siguiente
// a la última expensa del departamento, el que sea mayor
export function periodosAdelantados(ultimaExpensa, cantidad) {
    let actual = hoy().slice(0, 7);
    let siguiente = ultimaExpensa ? desplazarMes(ultimaExpensa, 1) : actual;
    let inicio = siguiente > actual ? siguiente : actual;
    return Array.from({ length: cantidad }, (_, i) => desplazarMes(inicio, i));
}

// Reparte el pago, junto con el saldo a favor, entre los cargos del más antiguo al más nuevo.
//   cargos: [{ clave, concepto, periodo, saldo, nuevo }]
// Devuelve cada cargo con lo que se le aplica y lo que queda debiendo, más el saldo a favor que sobra
export function simularPago(monto, saldoFavor, cargos) {
    let disponible = centavos(monto) + centavos(saldoFavor);
    let ordenados = [...cargos].sort((a, b) => a.periodo.localeCompare(b.periodo));
    let detalle = ordenados.map((cargo) => {
        let saldo = centavos(cargo.saldo);
        let aplicado = Math.min(disponible, saldo);
        disponible -= aplicado;
        return { ...cargo, aplicado: aplicado / 100, restante: (saldo - aplicado) / 100 };
    });
    let restante = detalle.reduce((suma, cargo) => suma + centavos(cargo.restante), 0);
    return { detalle, aFavor: disponible / 100, deudaRestante: restante / 100 };
}
