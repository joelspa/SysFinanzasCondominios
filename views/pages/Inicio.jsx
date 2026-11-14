import useDatos from '../hooks/useDatos';
import Icono from '../components/Icono';
import Estado from '../components/Estado';
import Indicador from '../components/Indicador';
import Cargando from '../components/Cargando';
import { GraficoColumnas, BarraEstados, BarrasHorizontales } from '../components/Graficos';
import { dinero, dineroConSigno, formatoFecha, hoy, mesActual, desplazarMes, mesCorto, mesLargo, capitalizar, sumar } from '../formato';
import { estaDisponible, enlaceFicha } from '../logica/departamentos';

const SERIES = [
    { clave: 'ingresos', etiqueta: 'Ingresos', clase: 'serie-1' },
    { clave: 'gastos', etiqueta: 'Gastos', clase: 'serie-2' }
];

function saludo() {
    let hora = new Date().getHours();
    if (hora < 12) {
        return 'Buenos días';
    }
    return hora < 19 ? 'Buenas tardes' : 'Buenas noches';
}

// Pagos y gastos juntos, del más reciente al más antiguo
function ultimosMovimientos(ingresos, egresos, cantidad) {
    let lista = ingresos.map((i) => ({
        clave: 'i' + i.id_ingreso, fecha: i.fecha, entrada: true, etiqueta: i.departamento,
        concepto: i.concepto, monto: i.monto, anulado: i.estado === 'anulado', enlace: '/ingreso/comprobante?id=' + i.id_ingreso
    })).concat(egresos.map((e) => ({
        clave: 'e' + e.id_egreso, fecha: e.fecha, entrada: false, etiqueta: 'Gasto',
        concepto: e.concepto, monto: e.monto, anulado: e.estado === 'anulado', enlace: '/egreso/comprobante?id=' + e.id_egreso
    })));
    return lista.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, cantidad);
}

// Panel principal: indicadores calculados con los datos de cargos, ingresos, gastos y departamentos
export default function Inicio() {
    const cargos = useDatos('/api/cargo/obtenerCargos', { Cargos: [], Departamentos: [] });
    const ingresos = useDatos('/api/ingreso/obtenerIngresos', { Ingresos: [], Departamentos: [], Tipos: [], Pendientes: [] });
    const egresos = useDatos('/api/egreso/obtenerEgresos', { Egresos: [], Tipos: [], Caja: {} });
    const departamentos = useDatos('/api/departamento/obtenerDepartamentos', { Departamentos: [], Tipos: [] });

    const fuentes = [cargos, ingresos, egresos, departamentos];
    const error = fuentes.map((f) => f.error).find((e) => e);
    if (error || fuentes.some((f) => f.cargando)) {
        return <Cargando texto="Cargando el panel..." error={error && 'No se pudieron cargar los datos del panel: ' + error} />;
    }

    const listaCargos = cargos.datos.Cargos;
    const listaDepartamentos = departamentos.datos.Departamentos;
    const caja = egresos.datos.Caja;

    // Solo cuentan los movimientos registrados (los anulados no)
    const pagos = ingresos.datos.Ingresos.filter((i) => i.estado === 'registrado');
    const gastos = egresos.datos.Egresos.filter((e) => e.estado === 'registrado');
    const esteMes = mesActual();
    const delMes = (lista, mes) => lista.filter((m) => m.fecha.startsWith(mes));

    const saldoCaja = Number(caja.saldo);
    const resultadoMes = sumar(delMes(pagos, esteMes)) - sumar(delMes(gastos, esteMes));

    const meses = [5, 4, 3, 2, 1, 0].map((n) => {
        let clave = desplazarMes(esteMes, -n);
        let entrada = sumar(delMes(pagos, clave));
        let salida = sumar(delMes(gastos, clave));
        let resultado = entrada - salida;
        return {
            clave, etiqueta: mesCorto(clave), detalle: capitalizar(mesLargo(clave)),
            valores: { ingresos: entrada, gastos: salida },
            nota: (resultado >= 0 ? 'Ganancia ' : 'Pérdida ') + dinero(Math.abs(resultado))
        };
    });
    const resultadoPeriodo = meses.reduce((suma, m) => suma + m.valores.ingresos - m.valores.gastos, 0);

    const gastosPorTipo = egresos.datos.Tipos
        .map((t) => ({ etiqueta: t.nombre, valor: sumar(gastos.filter((e) => e.id_tipo_egreso == t.id_tipo_egreso)) }))
        .filter((t) => t.valor > 0)
        .sort((a, b) => b.valor - a.valor);

    // Cobranza: lo cobrado de los cargos, lo que falta (sin vencer) y lo vencido
    const porCobrar = listaCargos.filter((c) => c.estado === 'pendiente' || c.estado === 'parcial');
    const vencidos = listaCargos.filter((c) => c.estado === 'vencido');
    const emitido = sumar(listaCargos);
    const cobrado = sumar(listaCargos, 'pagado');
    const porcentajeCobrado = emitido > 0 ? cobrado / emitido * 100 : 0;
    const departamentosEnMora = new Set(vencidos.map((c) => c.id_departamento));
    const deudaTotal = sumar(porCobrar, 'saldo') + sumar(vencidos, 'saldo');

    // Disponibilidad
    const activos = listaDepartamentos.filter((d) => d.estado === 'activo');
    const disponibles = activos.filter(estaDisponible);
    const ocupacion = activos.length > 0 ? (activos.length - disponibles.length) / activos.length * 100 : 0;

    const morosos = listaDepartamentos.filter((d) => Number(d.deuda) > 0)
        .sort((a, b) => Number(b.deuda) - Number(a.deuda)).slice(0, 6);
    const movimientos = ultimosMovimientos(ingresos.datos.Ingresos, egresos.datos.Egresos, 6);

    return (
        <>
            <div className="encabezado">
                <div>
                    <h1>{saludo()}, Administrador</h1>
                    <p>Resumen financiero del condominio al {formatoFecha(hoy())}.</p>
                </div>
                <div className="encabezado-acciones">
                    <a className="btn btn-outline-primary" href="/egreso"><Icono nombre="gastos" tamano={16} /> Registrar gasto</a>
                    <a className="btn btn-primary" href="/ingreso"><Icono nombre="mas" tamano={16} /> Registrar pago</a>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta="Saldo en caja" valor={dineroConSigno(saldoCaja)} icono="caja" tono={saldoCaja < 0 ? 'critico' : ''}>
                        <span className="indicador-detalle">Ingresos {dinero(caja.ingresos)} · Gastos {dinero(caja.egresos)}</span>
                    </Indicador>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta="Resultado del mes" icono="balanza" tono={resultadoMes < 0 ? 'critico' : ''}
                        valor={<span className={resultadoMes < 0 ? 'baja' : ''}>{dineroConSigno(resultadoMes)}</span>}>
                        <span className="indicador-detalle">
                            <b className={resultadoMes >= 0 ? 'sube' : 'baja'}>{resultadoMes >= 0 ? 'Ganancia' : 'Pérdida'}</b>
                            {' '}en {mesLargo(esteMes)} · cobrado {dinero(sumar(delMes(pagos, esteMes)))}
                        </span>
                    </Indicador>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta="Por cobrar" valor={dinero(deudaTotal)} icono="reloj" tono="aviso">
                        <span className="indicador-detalle">
                            {departamentosEnMora.size === 0 ? 'Ningún departamento en mora'
                                : <><b className="baja">{dinero(sumar(vencidos, 'saldo'))} en mora</b> · {departamentosEnMora.size} {departamentosEnMora.size === 1 ? 'departamento' : 'departamentos'}</>}
                        </span>
                    </Indicador>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta="Disponibilidad" icono="departamentos"
                        valor={disponibles.length === 0 ? 'Sin disponibles' : disponibles.length + (disponibles.length === 1 ? ' disponible' : ' disponibles')}>
                        <span className="indicador-detalle">
                            {disponibles.length === 0
                                ? 'Todos los departamentos están ocupados'
                                : (activos.length - disponibles.length) + ' de ' + activos.length + ' ocupados (' + ocupacion.toFixed(0) + '%)'}
                        </span>
                        <div className="medidor"><span style={{ width: ocupacion + '%' }}></span></div>
                    </Indicador>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-xl-8">
                    <section className="panel h-100">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Ingresos y gastos de los últimos 6 meses</h2>
                                <p>Movimientos registrados por mes (no incluye anulados)</p>
                            </div>
                            <div className="text-end">
                                <span className={'panel-total' + (resultadoPeriodo < 0 ? ' baja' : '')}>{dineroConSigno(resultadoPeriodo)}</span>
                                <small className="secundario">{resultadoPeriodo >= 0 ? 'de ganancia' : 'de pérdida'} en el período</small>
                            </div>
                        </div>
                        <div className="panel-cuerpo">
                            <GraficoColumnas datos={meses} series={SERIES} />
                        </div>
                    </section>
                </div>
                <div className="col-xl-4">
                    <section className="panel h-100">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Estado de cobranza</h2>
                                <p>Del total emitido a los departamentos</p>
                            </div>
                        </div>
                        <div className="panel-cuerpo">
                            {emitido === 0 ? (
                                <div className="panel-vacio">Aún no hay cargos emitidos.</div>
                            ) : (
                                <>
                                    <div className="cifra-grande">
                                        {porcentajeCobrado.toFixed(0)}%<small>cobrado</small>
                                    </div>
                                    <p className="secundario mb-3">{dinero(cobrado)} de {dinero(emitido)}</p>
                                    <BarraEstados segmentos={[
                                        { clave: 'pagado', etiqueta: 'Cobrado', tono: 'bueno', cantidad: listaCargos.filter((c) => c.estado === 'pagado').length, monto: cobrado },
                                        { clave: 'pendiente', etiqueta: 'Por cobrar', tono: 'aviso', cantidad: porCobrar.length, monto: sumar(porCobrar, 'saldo') },
                                        { clave: 'vencido', etiqueta: 'Vencido', tono: 'critico', cantidad: vencidos.length, monto: sumar(vencidos, 'saldo') }
                                    ]} />
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-6 col-xl-4">
                    <section className="panel h-100 d-flex flex-column">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Departamentos con deuda</h2>
                                <p>De mayor a menor deuda</p>
                            </div>
                        </div>
                        {morosos.length === 0 ? (
                            <div className="panel-vacio">Todos los departamentos están al día.</div>
                        ) : (
                            <ul className="lista">
                                {morosos.map((d) => (
                                    <li key={d.id_departamento}>
                                        <a className="etiqueta enlace-etiqueta" href={enlaceFicha(d.id_departamento)}>{d.numero}</a>
                                        <span className="flex-grow-1 text-truncate">
                                            {d.propietario || 'Sin propietario'}
                                            <span className="d-block mt-1">
                                                <Estado valor={departamentosEnMora.has(d.id_departamento) ? 'vencido' : 'pendiente'} />
                                            </span>
                                        </span>
                                        <span className="numero fw-semibold texto-deuda">{dinero(d.deuda)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <a className="panel-pie" href="/cargo">Ver cuentas por cobrar <Icono nombre="flecha" tamano={16} /></a>
                    </section>
                </div>

                <div className="col-lg-6 col-xl-4">
                    <section className="panel h-100 d-flex flex-column">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Últimos movimientos</h2>
                                <p>Pagos recibidos y gastos</p>
                            </div>
                        </div>
                        {movimientos.length === 0 ? (
                            <div className="panel-vacio">Aún no hay movimientos registrados.</div>
                        ) : (
                            <ul className="lista">
                                {movimientos.map((m) => (
                                    <li key={m.clave} className={m.anulado ? 'anulado' : ''}>
                                        <span className={'etiqueta' + (m.entrada ? '' : ' etiqueta-gasto')}>{m.etiqueta}</span>
                                        <a className="flex-grow-1 text-truncate enlace" href={m.enlace}>
                                            {m.concepto}
                                            <small className="secundario">{formatoFecha(m.fecha)}{m.anulado && ' · anulado'}</small>
                                        </a>
                                        <span className={'numero fw-semibold monto' + (m.entrada ? ' sube' : '')}>
                                            {m.entrada ? '+' : '−'}{dinero(m.monto)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="panel-pie-doble">
                            <a href="/ingreso">Ver ingresos</a>
                            <a href="/egreso">Ver gastos</a>
                        </div>
                    </section>
                </div>

                <div className="col-lg-12 col-xl-4">
                    <section className="panel h-100">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Gastos por tipo</h2>
                                <p>Total histórico registrado</p>
                            </div>
                        </div>
                        <div className="panel-cuerpo">
                            {gastosPorTipo.length === 0
                                ? <div className="panel-vacio">Aún no hay gastos registrados.</div>
                                : <BarrasHorizontales datos={gastosPorTipo} clase="serie-2" />}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
