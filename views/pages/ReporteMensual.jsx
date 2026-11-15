import { useState } from 'react';
import useDatos from '../hooks/useDatos';
import { dinero, dineroConSigno, formatoFecha, capitalizar, hoy, mesActual, mesLargo, sumar, numeroRecibo, cantidad } from '../formato';
import { enlaceFicha } from '../logica/departamentos';
import Encabezado from '../components/Encabezado';
import Cargando from '../components/Cargando';
import Membrete from '../components/Membrete';
import Resumen from '../components/Resumen';
import Icono from '../components/Icono';
import Nota from '../components/Nota';
import BarraProgreso from '../components/BarraProgreso';
import { BarrasHorizontales } from '../components/Graficos';

// Suma los montos por tipo y los ordena de mayor a menor: [{ etiqueta, valor }] para las barras
function porTipo(movimientos) {
    let totales = {};
    movimientos.forEach((m) => { totales[m.tipo] = (totales[m.tipo] || 0) + Number(m.monto); });
    return Object.entries(totales).map(([etiqueta, valor]) => ({ etiqueta, valor })).sort((a, b) => b.valor - a.valor);
}

// Rendición de cuentas de un mes, lista para imprimir o guardar como PDF: con cuánto empezó el
// condominio, qué entró, qué salió, con cuánto terminó, cómo va la cobranza y quiénes están en mora.
export default function ReporteMensual() {
    const [periodo, setPeriodo] = useState(mesActual());
    const reporte = useDatos('/api/reporte/obtenerMensual?periodo=' + periodo, null);

    if (!reporte.datos) {
        return <Cargando texto="Preparando el reporte..." error={reporte.error} />;
    }

    const { Condominio: condominio, Periodo: mes, SaldoInicial: inicial, SaldoFinal: final,
        Ingresos: ingresos, Egresos: egresos, Cobranza: cobranza, Morosos: morosos } = reporte.datos;
    const totalIngresos = sumar(ingresos);
    const totalEgresos = sumar(egresos);
    const resultado = totalIngresos - totalEgresos;
    const nombreMes = mesLargo(mes);

    return (
        <>
            <div className="no-imprimir">
                <Encabezado titulo="Reporte mensual" descripcion="Rendición de cuentas del mes, para presentar a los propietarios.">
                    {/* Un mes vacío no se envía: el reporte siempre es de un mes */}
                    <input type="month" className="form-control selector-mes" aria-label="Mes del reporte" max={mesActual()}
                        value={periodo} onChange={(e) => e.target.value && setPeriodo(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => window.print()}>
                        <Icono nombre="imprimir" tamano={16} /> Imprimir o guardar PDF
                    </button>
                </Encabezado>
            </div>

            <article className="reporte">
                <header className="panel reporte-cabecera">
                    <Membrete condominio={condominio} />
                    <div className="text-end">
                        <span className="secundario">Rendición de cuentas</span>
                        <strong className="reporte-mes">{capitalizar(nombreMes)}</strong>
                        <span className="secundario">Emitido el {formatoFecha(hoy())}</span>
                    </div>
                </header>

                <Resumen items={[
                    { etiqueta: 'Saldo al inicio del mes', valor: dineroConSigno(inicial.saldo) },
                    { etiqueta: 'Ingresos del mes', valor: dinero(totalIngresos), detalle: cantidad(sumar(ingresos, 'cantidad'), 'pago recibido', 'pagos recibidos') },
                    { etiqueta: 'Gastos del mes', valor: dinero(totalEgresos), detalle: cantidad(egresos.length, 'gasto', 'gastos') },
                    {
                        etiqueta: 'Saldo al final del mes', valor: dineroConSigno(final.saldo),
                        detalle: (resultado >= 0 ? 'Ganancia de ' : 'Pérdida de ') + dinero(Math.abs(resultado)) + ' en el mes',
                        tono: Number(final.saldo) < 0 ? 'critico' : 'bueno'
                    }
                ]} />

                <section className="panel panel-tabla">
                    <div className="panel-cabecera">
                        <div><h2>Dónde está el dinero</h2><p>El efectivo está en la caja; transferencias, QR y tarjeta, en el banco</p></div>
                    </div>
                    <table className="table tabla">
                        <thead>
                            <tr><th>Cuenta</th><th className="text-end">Al inicio del mes</th><th className="text-end">Al final del mes</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Caja (efectivo)</td>
                                <td className="text-end numero">{dineroConSigno(inicial.efectivo)}</td>
                                <td className="text-end numero">{dineroConSigno(final.efectivo)}</td>
                            </tr>
                            <tr>
                                <td>Banco</td>
                                <td className="text-end numero">{dineroConSigno(inicial.banco)}</td>
                                <td className="text-end numero">{dineroConSigno(final.banco)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>Total disponible</th>
                                <th className="text-end numero">{dineroConSigno(inicial.saldo)}</th>
                                <th className="text-end numero">{dineroConSigno(final.saldo)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </section>

                {/* En pantalla van lado a lado; al imprimir, uno debajo del otro (ver .reporte-columnas) */}
                <div className="reporte-columnas">
                    <section className="panel">
                        <div className="panel-cabecera">
                            <div><h2>Ingresos por tipo</h2><p>Lo que entró en {nombreMes}</p></div>
                            <span className="panel-total">{dinero(totalIngresos)}</span>
                        </div>
                        <div className="panel-cuerpo">
                            {ingresos.length === 0
                                ? <div className="panel-vacio">No se registraron ingresos en {nombreMes}.</div>
                                : <BarrasHorizontales datos={ingresos.map((i) => ({ etiqueta: i.tipo, valor: Number(i.monto) }))} />}
                        </div>
                    </section>
                    <section className="panel">
                        <div className="panel-cabecera">
                            <div><h2>Gastos por tipo</h2><p>Lo que salió en {nombreMes}</p></div>
                            <span className="panel-total">{dinero(totalEgresos)}</span>
                        </div>
                        <div className="panel-cuerpo">
                            {egresos.length === 0
                                ? <div className="panel-vacio">No se registraron gastos en {nombreMes}.</div>
                                : <BarrasHorizontales datos={porTipo(egresos)} clase="serie-2" />}
                        </div>
                    </section>
                </div>

                {egresos.length > 0 && (
                    <section className="panel panel-tabla">
                        <div className="panel-cabecera">
                            <div><h2>Detalle de gastos</h2><p>Cada gasto con su comprobante y el respaldo del proveedor</p></div>
                        </div>
                        <div className="table-responsive">
                            <table className="table tabla">
                                <thead>
                                    <tr>
                                        <th>Comprobante</th>
                                        <th>Concepto</th>
                                        <th>Pagado a</th>
                                        <th>Método</th>
                                        <th className="text-end">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {egresos.map((egreso) => (
                                        <tr key={egreso.id_egreso}>
                                            <td className="text-nowrap">
                                                <span className="numero fw-semibold">Nº {numeroRecibo(egreso.numero)}</span>
                                                <span className="secundario">{formatoFecha(egreso.fecha)}</span>
                                            </td>
                                            <td>{egreso.concepto}<span className="secundario">{egreso.tipo}</span></td>
                                            <td>
                                                {egreso.proveedor || '—'}
                                                {egreso.numero_documento && <span className="secundario">Doc. {egreso.numero_documento}</span>}
                                            </td>
                                            <td>{capitalizar(egreso.metodo_pago)}</td>
                                            <td className="text-end numero">{dinero(egreso.monto)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colSpan={4} className="text-end">Total de gastos</th>
                                        <th className="text-end numero">{dinero(totalEgresos)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>
                )}

                <section className="panel">
                    <div className="panel-cabecera">
                        <div><h2>Cobranza de {nombreMes}</h2><p>Expensas y demás cargos emitidos para ese mes</p></div>
                    </div>
                    <div className="panel-cuerpo">
                        {cobranza.cargos === 0 ? (
                            <div className="panel-vacio">No se emitieron cargos para {nombreMes}.</div>
                        ) : (
                            <>
                                <dl className="reporte-cobranza">
                                    <div><dt>Emitido</dt><dd className="numero">{dinero(cobranza.emitido)}</dd></div>
                                    <div><dt>Cobrado</dt><dd className="numero sube">{dinero(cobranza.cobrado)}</dd></div>
                                    <div>
                                        <dt>Falta cobrar</dt>
                                        <dd className={'numero' + (Number(cobranza.pendiente) > 0 ? ' texto-deuda' : '')}>{dinero(cobranza.pendiente)}</dd>
                                    </div>
                                </dl>
                                <BarraProgreso valor={Number(cobranza.cobrado)} total={Number(cobranza.emitido)} />
                                <span className="secundario">
                                    Se cobró el {(Number(cobranza.cobrado) / Number(cobranza.emitido) * 100).toFixed(0)}% de {cantidad(cobranza.cargos, 'cargo', 'cargos')}.
                                </span>
                            </>
                        )}
                    </div>
                </section>

                <section className="panel panel-tabla">
                    <div className="panel-cabecera">
                        <div><h2>Departamentos en mora</h2><p>Con cargos vencidos al {formatoFecha(hoy())}</p></div>
                        {morosos.length > 0 && <span className="panel-total texto-deuda">{dinero(sumar(morosos, 'deuda'))}</span>}
                    </div>
                    {morosos.length === 0 ? (
                        <div className="panel-cuerpo"><Nota tono="bueno">Ningún departamento tiene cargos vencidos.</Nota></div>
                    ) : (
                        <table className="table tabla">
                            <thead>
                                <tr><th>Departamento</th><th>Propietario</th><th>Debe desde</th><th className="text-end">Deuda vencida</th></tr>
                            </thead>
                            <tbody>
                                {morosos.map((moroso) => (
                                    <tr key={moroso.id_departamento}>
                                        <td><a className="etiqueta enlace-etiqueta" href={enlaceFicha(moroso.id_departamento)}>{moroso.numero}</a></td>
                                        <td>{moroso.propietario || 'Sin propietario'}</td>
                                        <td>
                                            {capitalizar(mesLargo(moroso.desde))}
                                            <span className="secundario">{cantidad(moroso.cargos, 'cargo vencido', 'cargos vencidos')}</span>
                                        </td>
                                        <td className="text-end numero fw-semibold texto-deuda">{dinero(moroso.deuda)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                <div className="comprobante-firmas">
                    <div>Administración</div>
                    <div>Directorio</div>
                </div>
            </article>
        </>
    );
}
