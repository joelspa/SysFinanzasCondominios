import useDatos from '../hooks/useDatos';
import { parametro } from '../ruta';
import { dinero, formatoFecha, hoy, capitalizar, mesLargo, montoEnLetras, textoAnulacion } from '../formato';
import Cargando from '../components/Cargando';
import DocumentoComprobante, { DatosComprobante } from '../secciones/DocumentoComprobante';

const idIngreso = parametro('id');

// Recibo de un pago, con los cargos que cubrió
export default function Comprobante() {
    const comprobante = useDatos('/api/ingreso/obtenerComprobante?id_ingreso=' + idIngreso, null);
    if (!comprobante.datos) {
        return <Cargando texto="Cargando el recibo..." error={comprobante.error} />;
    }

    const { Ingreso: ingreso, Condominio: condominio } = comprobante.datos;
    const aplicaciones = ingreso.aplicaciones || [];
    // Si no se escribió quién pagó, se entiende que fue el propietario
    const pagador = ingreso.pagador || ingreso.propietario;

    return (
        <DocumentoComprobante tipo="Recibo de pago" numero={ingreso.numero} condominio={condominio}
            volver={{ href: '/ingreso', texto: 'Ingresos' }} anulacion={ingreso.motivo_anulacion && textoAnulacion(ingreso)}
            firmas={['Recibí conforme', 'Entregué conforme']}>
            {/* Un ingreso sin departamento es del condominio: no tiene propietario ni cuenta que mostrar */}
            <DatosComprobante datos={[
                { etiqueta: 'Recibí de', valor: pagador },
                { etiqueta: 'CI o NIT', valor: ingreso.pagador_documento },
                { etiqueta: 'Fecha de pago', valor: formatoFecha(ingreso.fecha) },
                { etiqueta: 'Departamento', valor: ingreso.departamento || 'Ingreso del condominio' },
                { etiqueta: 'Propietario', valor: ingreso.departamento ? (ingreso.propietario || 'Sin registrar') : '—' },
                { etiqueta: 'Tipo de ingreso', valor: ingreso.tipo_ingreso },
                { etiqueta: 'Método de pago', valor: capitalizar(ingreso.metodo_pago) + (ingreso.referencia ? ' · Ref. ' + ingreso.referencia : '') },
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
            <p className="comprobante-literal">Son: {montoEnLetras(ingreso.monto)}</p>

            {ingreso.estado === 'registrado' && ingreso.departamento && (
                <p className="comprobante-pie">
                    {/* Es el saldo de hoy, no el del día del pago: si el recibo se reimprime después, la fecha lo aclara */}
                    Saldo del departamento al {formatoFecha(hoy())}: deuda {dinero(ingreso.deuda)} · a favor {dinero(ingreso.saldo_favor)}
                </p>
            )}
        </DocumentoComprobante>
    );
}
