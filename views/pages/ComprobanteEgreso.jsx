import useDatos from '../hooks/useDatos';
import { parametro } from '../ruta';
import { dinero, formatoFecha, capitalizar, montoEnLetras, textoAnulacion } from '../formato';
import Cargando from '../components/Cargando';
import DocumentoComprobante, { DatosComprobante } from '../secciones/DocumentoComprobante';

const idEgreso = parametro('id');

// Comprobante de un gasto del condominio (respaldo interno del pago al proveedor)
export default function ComprobanteEgreso() {
    const comprobante = useDatos('/api/egreso/obtenerComprobante?id_egreso=' + idEgreso, null);
    if (!comprobante.datos) {
        return <Cargando texto="Cargando el comprobante..." error={comprobante.error} />;
    }

    const { Egreso: egreso, Condominio: condominio } = comprobante.datos;

    return (
        <DocumentoComprobante tipo="Comprobante de egreso" numero={egreso.numero} condominio={condominio}
            volver={{ href: '/egreso', texto: 'Gastos' }} anulacion={egreso.motivo_anulacion && textoAnulacion(egreso)}
            firmas={['Autorizado por', 'Recibí conforme']}>
            <DatosComprobante datos={[
                { etiqueta: 'Fecha', valor: formatoFecha(egreso.fecha) },
                { etiqueta: 'Pagado a', valor: egreso.proveedor },
                { etiqueta: 'Factura o recibo', valor: egreso.numero_documento },
                { etiqueta: 'Método de pago', valor: capitalizar(egreso.metodo_pago) },
                { etiqueta: 'Tipo de gasto', valor: egreso.tipo_egreso },
                { etiqueta: 'Registrado por', valor: egreso.usuario }
            ]} />

            <p className="comprobante-concepto"><span className="secundario">Concepto</span>{egreso.concepto}</p>
            {egreso.observacion && <p className="comprobante-pie mt-0 mb-3">Observación: {egreso.observacion}</p>}

            <div className="comprobante-totales">
                <div className="comprobante-total"><span>Total pagado</span><span className="numero">{dinero(egreso.monto)}</span></div>
            </div>
            <p className="comprobante-literal">Son: {montoEnLetras(egreso.monto)}</p>
        </DocumentoComprobante>
    );
}
