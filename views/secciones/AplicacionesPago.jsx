import { capitalizar, mesLargo } from '../formato';
import { CONCEPTO_EXPENSAS } from '../opciones';

const MAXIMO = 3;

// Etiquetas con los meses que cubre un pago (ej. "Nov 2026", "Dic 2026 · parcial")
export default function AplicacionesPago({ ingreso }) {
    if (!ingreso.aplica_deuda) {
        return <span className="text-body-tertiary small">No aplica a deudas</span>;
    }
    let aplicaciones = ingreso.aplicaciones || [];
    if (aplicaciones.length === 0) {
        return <span className="text-body-tertiary small">{ingreso.estado === 'anulado' ? '—' : 'Saldo a favor'}</span>;
    }
    return (
        <div className="chips">
            {aplicaciones.slice(0, MAXIMO).map((a) => (
                <span key={a.id_cargo} className="chip" title={a.concepto}>
                    {a.concepto !== CONCEPTO_EXPENSAS && a.concepto + ' '}{capitalizar(mesLargo(a.periodo))}
                    {Number(a.monto) < Number(a.total) && ' · parcial'}
                </span>
            ))}
            {aplicaciones.length > MAXIMO && <span className="chip chip-mas">+{aplicaciones.length - MAXIMO} más</span>}
        </div>
    );
}
