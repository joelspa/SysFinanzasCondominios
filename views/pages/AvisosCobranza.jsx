import { useState } from 'react';
import useDatos from '../hooks/useDatos';
import { dinero, formatoFecha, capitalizar, hoy, mesLargo, sumar, montoEnLetras, contactoCondominio, cantidad } from '../formato';
import Cargando from '../components/Cargando';
import Membrete from '../components/Membrete';
import Icono from '../components/Icono';
import Nota from '../components/Nota';
import Casilla from '../components/Casilla';
import Estado from '../components/Estado';

// Un aviso por departamento con deuda: { departamento, cargos pendientes del más antiguo al más nuevo }
function armarAvisos(departamentos, cargos, soloVencidos) {
    let pendientes = cargos.filter((c) => Number(c.saldo) > 0);
    return departamentos
        .map((departamento) => ({
            departamento,
            cargos: pendientes.filter((c) => c.id_departamento === departamento.id_departamento)
                .sort((a, b) => a.periodo.localeCompare(b.periodo))
        }))
        .filter((aviso) => aviso.cargos.length > 0 && (!soloVencidos || aviso.cargos.some((c) => c.estado === 'vencido')));
}

// Avisos de cobranza listos para imprimir: una hoja por departamento con deuda, con el detalle
// de lo que debe. Usa los mismos datos que Cuentas por cobrar.
export default function AvisosCobranza() {
    const cuentas = useDatos('/api/cargo/obtenerCargos', null);
    const condominio = useDatos('/api/condominio/obtenerCondominio', null);
    const [soloVencidos, setSoloVencidos] = useState(false);

    if (!cuentas.datos || !condominio.datos) {
        return <Cargando texto="Preparando los avisos..." error={cuentas.error || condominio.error} />;
    }

    const avisos = armarAvisos(cuentas.datos.Departamentos, cuentas.datos.Cargos, soloVencidos);
    const contacto = contactoCondominio(condominio.datos);

    return (
        <>
            <div className="comprobante-acciones no-imprimir">
                <a className="volver mb-0" href="/cargo"><Icono nombre="volver" tamano={16} /> Cuentas por cobrar</a>
                <Casilla etiqueta="Solo departamentos con deuda vencida" marcado={soloVencidos} onCambiar={setSoloVencidos} />
                <button className="btn btn-primary" disabled={avisos.length === 0} onClick={() => window.print()}>
                    <Icono nombre="imprimir" tamano={16} /> Imprimir {cantidad(avisos.length, 'aviso', 'avisos')}
                </button>
            </div>

            {avisos.length === 0 && (
                <div className="aviso-vacio">
                    <Nota tono="bueno" titulo="No hay avisos que imprimir">
                        {soloVencidos ? 'Ningún departamento tiene deuda vencida.' : 'Ningún departamento tiene deuda pendiente.'}
                    </Nota>
                </div>
            )}

            {avisos.map(({ departamento, cargos }) => (
                <article className="panel comprobante aviso-cobranza" key={departamento.id_departamento}>
                    <header className="comprobante-cabecera">
                        <Membrete condominio={condominio.datos} />
                        <div className="text-end">
                            <span className="secundario">Aviso de cobranza</span>
                            <strong className="comprobante-numero">Departamento {departamento.numero}</strong>
                            <span className="secundario">{formatoFecha(hoy())}</span>
                        </div>
                    </header>

                    <p>
                        Señor(a) <strong>{departamento.propietario || 'propietario'}</strong>: le recordamos que su departamento
                        tiene {cantidad(cargos.length, 'cargo pendiente', 'cargos pendientes')} de pago.
                    </p>

                    <table className="table tabla comprobante-tabla">
                        <thead>
                            <tr>
                                <th>Período</th>
                                <th>Concepto</th>
                                <th>Vencimiento</th>
                                <th className="text-end">Monto</th>
                                <th className="text-end">Pagado</th>
                                <th className="text-end">Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargos.map((cargo) => (
                                <tr key={cargo.id_cargo}>
                                    <td>{capitalizar(mesLargo(cargo.periodo))}</td>
                                    <td>{cargo.concepto}</td>
                                    <td>
                                        {formatoFecha(cargo.vencimiento)}
                                        {cargo.estado === 'vencido' && <span className="d-block mt-1"><Estado valor="vencido" /></span>}
                                    </td>
                                    <td className="text-end numero">{dinero(cargo.monto)}</td>
                                    <td className="text-end numero">{dinero(cargo.pagado)}</td>
                                    <td className="text-end numero fw-semibold">{dinero(cargo.saldo)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="comprobante-totales">
                        <div className="comprobante-total"><span>Total a pagar</span><span className="numero">{dinero(sumar(cargos, 'saldo'))}</span></div>
                    </div>
                    <p className="comprobante-literal">Son: {montoEnLetras(sumar(cargos, 'saldo'))}</p>

                    <p className="comprobante-pie">
                        Puede pagar en la administración del condominio{contacto && ' (' + contacto + ')'}.
                        Si ya realizó el pago, por favor no tome en cuenta este aviso.
                    </p>
                </article>
            ))}
        </>
    );
}
