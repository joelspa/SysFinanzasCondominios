import Icono from '../components/Icono';
import Nota from '../components/Nota';
import { dinero, mesLargo, capitalizar } from '../formato';

// Muestra, antes de guardar, a qué cargos se aplicará el pago y cómo queda la cuenta
//   simulacion: resultado de simularPago() (views/logica/pagos.js)
export default function VistaPreviaPago({ simulacion, monto }) {
    if (simulacion.detalle.length === 0 && !(Number(monto) > 0)) {
        return (
            <Nota tono="info" titulo="Sin deudas pendientes">
                El departamento está al día. Puede adelantar meses o lo que pague quedará como saldo a favor.
            </Nota>
        );
    }
    return (
        <div className="vista-previa">
            <h6>Cómo se aplicará el pago</h6>
            <ul>
                {simulacion.detalle.map((cargo) => (
                    <li key={cargo.clave} className={cargo.aplicado === 0 ? 'sin-cubrir' : ''}>
                        <div className="flex-grow-1">
                            <strong>{cargo.concepto} {capitalizar(mesLargo(cargo.periodo))}</strong>
                            {cargo.nuevo && <span className="chip">Adelantado</span>}
                            <span className="secundario">
                                {cargo.restante === 0 ? 'Queda pagado'
                                    : cargo.aplicado > 0 ? 'Queda debiendo ' + dinero(cargo.restante)
                                        : 'No alcanza con este pago'}
                            </span>
                        </div>
                        <span className="numero fw-semibold">{dinero(cargo.aplicado)}</span>
                    </li>
                ))}
            </ul>
            <div className="vista-previa-total">
                {simulacion.deudaRestante > 0 && (
                    <div><span>Queda debiendo</span><strong className="texto-deuda">{dinero(simulacion.deudaRestante)}</strong></div>
                )}
                {simulacion.aFavor > 0 && (
                    <div><span>Saldo a favor</span><strong className="sube">{dinero(simulacion.aFavor)}</strong></div>
                )}
                {simulacion.deudaRestante === 0 && simulacion.aFavor === 0 && (
                    <div><span>La cuenta queda al día</span><Icono nombre="check" className="sube" /></div>
                )}
            </div>
        </div>
    );
}
