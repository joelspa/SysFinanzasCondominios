import useDatos from '../hooks/useDatos';
import { parametro } from '../ruta';
import { dinero, formatoFecha, capitalizar, mesLargo } from '../formato';
import DocumentoComprobante, { DatosComprobante, CargandoComprobante } from '../secciones/DocumentoComprobante';

const idIngreso = parametro('id');

// Comprobante de un pago recibido, con los cargos que cubrió
export default function Comprobante() {
    const comprobante = useDatos('/api/ingreso/obtenerComprobante?id_ingreso=' + idIngreso, null);
    if (!comprobante.datos) {
        return <CargandoComprobante error={comprobante.error} />;
    }

    const { Ingreso: ingreso, Condominio: condominio } = comprobante.datos;
    const aplicaciones = ingreso.aplicaciones || [];

    return (
        <DocumentoComprobante tipo="Comprobante de pago" numero={ingreso.id_ingreso} condominio={condominio}
            volver={{ href: '/ingreso', texto: 'Ingresos' }} motivoAnulacion={ingreso.motivo_anulacion}
            firmas={['Recibí conforme', 'Entregué conforme']}>
            <DatosComprobante datos={[
                { etiqueta: 'Fecha de pago', valor: formatoFecha(ingreso.fecha) },
                { etiqueta: 'Departamento', valor: ingreso.departamento },
                { etiqueta: 'Propietario', valor: ingreso.propietario || 'Sin registrar' },
                { etiqueta: 'Método de pago', valor: capitalizar(ingreso.metodo_pago) },
                { etiqueta: 'Tipo de ingreso', valor: ingreso.tipo_ingreso },
                { etiqueta: 'Registrado por', valor: ingreso.usuario }
            ]} />

            <p className="comprobante-concepto"><span className="secundario">Concepto</span>{ingreso.concepto}</p>

            {ingreso.aplica_deuda && (
                <table className="table tabla comprobante-tabla">
                    <thead>
                        <tr><th>Detalle</th><th>Período</th><th className="text-end">Importe del cargo</th><th className="text-end">Pagado</th></tr>
                    </thead>
                    <tbody>
                        {aplicaciones.length === 0 && (
                            <tr><td colSpan={4} className="text-body-secondary">El pago quedó como saldo a favor del departamento.</td></tr>
                        )}
                        {aplicaciones.map((a) => (
                            <tr key={a.id_cargo}>
                                <td>{a.concepto}{Number(a.monto) < Number(a.total) && <span className="secundario">Pago parcial</span>}</td>
                                <td>{capitalizar(mesLargo(a.periodo))}</td>
                                <td className="text-end numero">{dinero(a.total)}</td>
                                <td className="text-end numero">{dinero(a.monto)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="comprobante-totales">
                {Number(ingreso.a_favor) > 0 && <div><span>Queda como saldo a favor</span><span className="numero">{dinero(ingreso.a_favor)}</span></div>}
                <div className="comprobante-total"><span>Total recibido</span><span className="numero">{dinero(ingreso.monto)}</span></div>
            </div>

            {ingreso.estado === 'registrado' && (
                <p className="comprobante-pie">
                    Saldo del departamento a la fecha: deuda {dinero(ingreso.deuda)} · a favor {dinero(ingreso.saldo_favor)}
                </p>
            )}
        </DocumentoComprobante>
    );
}
