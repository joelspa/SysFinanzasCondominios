import Icono from '../components/Icono';

// Hoja de comprobante lista para imprimir o guardar como PDF (de pago o de gasto).
//   tipo: 'Comprobante de pago' | 'Comprobante de egreso'
//   volver: { href, texto } enlace para regresar
//   motivoAnulacion: si viene, el documento se marca como ANULADO
//   firmas: textos de las líneas de firma
export default function DocumentoComprobante({ tipo, numero, condominio, volver, motivoAnulacion, firmas, children }) {
    let anulado = !!motivoAnulacion;
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
                    <div className="d-flex align-items-center gap-3">
                        <span className="menu-logo"><Icono nombre="departamentos" tamano={20} /></span>
                        <div>
                            <strong className="d-block">{condominio ? condominio.nombre : 'Condominio'}</strong>
                            <span className="secundario">{condominio ? condominio.direccion : ''}</span>
                            {condominio && (condominio.nit || condominio.telefono || condominio.correo) && (
                                <span className="secundario">
                                    {[condominio.nit && 'NIT ' + condominio.nit, condominio.telefono && 'Tel. ' + condominio.telefono, condominio.correo]
                                        .filter(Boolean).join(' · ')}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-end">
                        <span className="secundario">{tipo}</span>
                        <strong className="comprobante-numero">Nº {String(numero).padStart(6, '0')}</strong>
                    </div>
                </header>

                {children}

                {anulado && <p className="comprobante-pie texto-deuda">Documento anulado. Motivo: {motivoAnulacion}</p>}

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

// Pantalla mientras carga o si falló la carga del comprobante
export function CargandoComprobante({ error }) {
    return (
        <div className="panel panel-cargando">
            {error
                ? <><Icono nombre="alerta" tamano={22} /> {error}</>
                : <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span> Cargando el comprobante...</>}
        </div>
    );
}
