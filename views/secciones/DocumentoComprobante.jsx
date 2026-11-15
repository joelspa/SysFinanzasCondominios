import Icono from '../components/Icono';
import Membrete from '../components/Membrete';
import { numeroRecibo } from '../formato';

// Hoja de comprobante lista para imprimir o guardar como PDF (de pago o de gasto).
//   tipo: 'Recibo de pago' | 'Comprobante de egreso'
//   numero: número correlativo del condominio
//   volver: { href, texto } enlace para regresar
//   anulacion: motivo, quién y cuándo (ver textoAnulacion). Si viene, el documento se marca como ANULADO
//   firmas: textos de las líneas de firma
export default function DocumentoComprobante({ tipo, numero, condominio, volver, anulacion, firmas, children }) {
    let anulado = !!anulacion;
    return (
        <>
            <div className="comprobante-acciones no-imprimir">
                <a className="volver mb-0" href={volver.href}><Icono nombre="volver" tamano={16} /> {volver.texto}</a>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    <Icono nombre="imprimir" tamano={16} /> Imprimir o guardar PDF
                </button>
            </div>

            <article className={'panel comprobante' + (anulado ? ' comprobante-anulado' : '')}>
                {anulado && <div className="sello-anulado" aria-hidden="true">ANULADO</div>}

                <header className="comprobante-cabecera">
                    <Membrete condominio={condominio} />
                    <div className="text-end">
                        <span className="secundario">{tipo}</span>
                        <strong className="comprobante-numero">Nº {numeroRecibo(numero)}</strong>
                    </div>
                </header>

                {children}

                {anulado && <p className="comprobante-pie texto-deuda">Documento anulado. Motivo: {anulacion}</p>}

                <div className="comprobante-firmas">
                    {firmas.map((firma) => <div key={firma}>{firma}</div>)}
                </div>
            </article>
        </>
    );
}

// Grilla de datos del comprobante: [{ etiqueta, valor }]
export function DatosComprobante({ datos }) {
    return (
        <dl className="comprobante-datos">
            {datos.map((dato) => (
                <div key={dato.etiqueta}><dt>{dato.etiqueta}</dt><dd>{dato.valor || '—'}</dd></div>
            ))}
        </dl>
    );
}
