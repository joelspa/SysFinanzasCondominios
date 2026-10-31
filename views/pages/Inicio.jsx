import { useState, useEffect } from 'react';
import { obtener } from '../api';
import Alerta from '../components/Alerta';
import Icono from '../components/Icono';
import Estado from '../components/Estado';
import Indicador from '../components/Indicador';
import { GraficoColumnas, BarraEstados, BarrasHorizontales } from '../components/Graficos';
import { dinero, formatoFecha, hoy, desplazarMes, mesCorto, mesLargo, capitalizar, sumar } from '../formato';

function saludo() {
    let hora = new Date().getHours();
    if (hora < 12) {
        return 'Buenos días';
    }
    return hora < 19 ? 'Buenas tardes' : 'Buenas noches';
}

// Panel principal: arma los indicadores con los datos de la API de ingresos, departamentos y residentes
export default function Inicio() {
    const [datos, setDatos] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let respuestas = await Promise.all([
            obtener('/api/ingreso/obtenerIngresos'),
            obtener('/api/departamento/obtenerDepartamentos'),
            obtener('/api/residente/obtenerResidentes')
        ]);
        let fallida = respuestas.find((respuesta) => !respuesta.Success);
        if (fallida) {
            setMensaje({ tipo: 'danger', texto: fallida.Mensaje });
            return;
        }
        let [ingresos, departamentos, residentes] = respuestas;
        setDatos({
            ingresos: ingresos.Data.Ingresos,
            cargos: ingresos.Data.Cargos,
            tipos: ingresos.Data.Tipos,
            departamentos: departamentos.Data.Departamentos,
            residentes: residentes.Data.Residentes
        });
    }

    useEffect(() => { cargar(); }, []);

    if (!datos) {
        return (
            <>
                <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />
                <div className="panel panel-cargando">
                    {mensaje
                        ? <><Icono nombre="alerta" tamano={22} /> No se pudieron cargar los datos del panel.</>
                        : <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span> Cargando el panel...</>}
                </div>
            </>
        );
    }

    const { ingresos, cargos, tipos, departamentos, residentes } = datos;

    // Ingresos: solo cuentan los registrados (los anulados no)
    const registrados = ingresos.filter((i) => i.estado === 'registrado');
    const mesActual = hoy().slice(0, 7);
    const mesAnterior = desplazarMes(mesActual, -1);
    const delMes = (mes) => registrados.filter((i) => i.fecha.startsWith(mes));
    const recaudadoMes = sumar(delMes(mesActual));
    const recaudadoAnterior = sumar(delMes(mesAnterior));
    const variacion = recaudadoAnterior > 0 ? (recaudadoMes - recaudadoAnterior) / recaudadoAnterior * 100 : null;

    const meses = [5, 4, 3, 2, 1, 0].map((n) => {
        let clave = desplazarMes(mesActual, -n);
        let lista = delMes(clave);
        return { clave, etiqueta: mesCorto(clave), detalle: capitalizar(mesLargo(clave)), valor: sumar(lista), cantidad: lista.length };
    });

    const porTipo = tipos
        .map((t) => ({ etiqueta: t.nombre, valor: sumar(registrados.filter((i) => i.id_tipo_ingreso == t.id_tipo_ingreso)) }))
        .filter((t) => t.valor > 0)
        .sort((a, b) => b.valor - a.valor);

    // Cargos (deudas de cada departamento)
    const pagados = cargos.filter((c) => c.estado === 'pagado');
    const pendientes = cargos.filter((c) => c.estado === 'pendiente');
    const vencidos = cargos.filter((c) => c.estado === 'vencido');
    const totalCargos = sumar(cargos);
    const porcentajeCobrado = totalCargos > 0 ? sumar(pagados) / totalCargos * 100 : 0;
    const porCobrar = [...vencidos, ...pendientes].slice(0, 6);

    // Ocupación: departamentos activos que tienen al menos un residente activo
    const numeroDepartamento = {};
    departamentos.forEach((d) => { numeroDepartamento[d.id_departamento] = d.numero; });
    const activos = departamentos.filter((d) => d.estado === 'activo');
    const conResidente = new Set(residentes.filter((r) => r.estado === 'activo').map((r) => r.id_departamento));
    const ocupados = activos.filter((d) => conResidente.has(d.id_departamento)).length;
    const ocupacion = activos.length > 0 ? ocupados / activos.length * 100 : 0;

    return (
        <>
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <div className="encabezado">
                <div>
                    <h1>{saludo()}, Administrador</h1>
                    <p>Resumen financiero del condominio al {formatoFecha(hoy())}.</p>
                </div>
                <a className="btn btn-primary" href="/ingreso">
                    <Icono nombre="mas" tamano={16} /> Registrar ingreso
                </a>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta={'Recaudado en ' + mesLargo(mesActual)} valor={dinero(recaudadoMes)} icono="ingresos">
                        {variacion === null ? (
                            <span className="indicador-detalle">Sin ingresos en {mesLargo(mesAnterior)}</span>
                        ) : (
                            <span className="indicador-detalle">
                                <b className={variacion >= 0 ? 'sube' : 'baja'}>
                                    {variacion >= 0 ? '▲' : '▼'} {Math.abs(variacion).toFixed(0)}%
                                </b> respecto a {mesLargo(mesAnterior)}
                            </span>
                        )}
                    </Indicador>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta="Por cobrar" valor={dinero(sumar(pendientes))} icono="reloj" tono="aviso">
                        <span className="indicador-detalle">
                            {pendientes.length} {pendientes.length === 1 ? 'cargo pendiente' : 'cargos pendientes'}
                        </span>
                    </Indicador>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta="En mora" valor={dinero(sumar(vencidos))} icono="alerta" tono="critico">
                        <span className="indicador-detalle">
                            {vencidos.length === 0 ? 'Ningún cargo vencido'
                                : vencidos.length + (vencidos.length === 1 ? ' cargo vencido' : ' cargos vencidos')}
                        </span>
                    </Indicador>
                </div>
                <div className="col-sm-6 col-xl-3">
                    <Indicador etiqueta="Ocupación" valor={ocupacion.toFixed(0) + '%'} icono="departamentos">
                        <span className="indicador-detalle">{ocupados} de {activos.length} departamentos con residentes</span>
                        <div className="medidor"><span style={{ width: ocupacion + '%' }}></span></div>
                    </Indicador>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-xl-8">
                    <section className="panel h-100">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Ingresos de los últimos 6 meses</h2>
                                <p>Pagos registrados por mes (no incluye anulados)</p>
                            </div>
                            <div className="text-end">
                                <span className="panel-total">{dinero(sumar(meses, 'valor'))}</span>
                                <small className="secundario">en el período</small>
                            </div>
                        </div>
                        <div className="panel-cuerpo">
                            <GraficoColumnas datos={meses} />
                        </div>
                    </section>
                </div>
                <div className="col-xl-4">
                    <section className="panel h-100">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Estado de cobranza</h2>
                                <p>Cargos emitidos a los departamentos</p>
                            </div>
                        </div>
                        <div className="panel-cuerpo">
                            {totalCargos === 0 ? (
                                <div className="panel-vacio">Aún no hay cargos emitidos.</div>
                            ) : (
                                <>
                                    <div className="cifra-grande">
                                        {porcentajeCobrado.toFixed(0)}%<small>cobrado</small>
                                    </div>
                                    <p className="secundario mb-3">{dinero(sumar(pagados))} de {dinero(totalCargos)}</p>
                                    <BarraEstados segmentos={[
                                        { clave: 'pagado', etiqueta: 'Pagado', tono: 'bueno', cantidad: pagados.length, monto: sumar(pagados) },
                                        { clave: 'pendiente', etiqueta: 'Pendiente', tono: 'aviso', cantidad: pendientes.length, monto: sumar(pendientes) },
                                        { clave: 'vencido', etiqueta: 'Vencido', tono: 'critico', cantidad: vencidos.length, monto: sumar(vencidos) }
                                    ]} />
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-6 col-xl-4">
                    <section className="panel h-100">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Ingresos por tipo</h2>
                                <p>Total histórico registrado</p>
                            </div>
                        </div>
                        <div className="panel-cuerpo">
                            {porTipo.length === 0
                                ? <div className="panel-vacio">Aún no hay ingresos registrados.</div>
                                : <BarrasHorizontales datos={porTipo} />}
                        </div>
                    </section>
                </div>

                <div className="col-lg-6 col-xl-4">
                    <section className="panel h-100 d-flex flex-column">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Cuentas por cobrar</h2>
                                <p>Cargos vencidos y pendientes</p>
                            </div>
                        </div>
                        {porCobrar.length === 0 ? (
                            <div className="panel-vacio">No hay deudas pendientes.</div>
                        ) : (
                            <ul className="lista">
                                {porCobrar.map((cargo) => (
                                    <li key={cargo.id_cargo}>
                                        <span className="etiqueta">{numeroDepartamento[cargo.id_departamento]}</span>
                                        <span className="flex-grow-1 text-truncate">
                                            {cargo.concepto} {mesLargo(cargo.periodo)}
                                            <span className="d-block mt-1"><Estado valor={cargo.estado} /></span>
                                        </span>
                                        <span className="numero fw-semibold">{dinero(cargo.monto)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <a className="panel-pie" href="/ingreso">Registrar un pago <Icono nombre="flecha" tamano={16} /></a>
                    </section>
                </div>

                <div className="col-lg-12 col-xl-4">
                    <section className="panel h-100 d-flex flex-column">
                        <div className="panel-cabecera">
                            <div>
                                <h2>Últimos ingresos</h2>
                                <p>Movimientos más recientes</p>
                            </div>
                        </div>
                        {ingresos.length === 0 ? (
                            <div className="panel-vacio">Aún no hay ingresos registrados.</div>
                        ) : (
                            <ul className="lista">
                                {ingresos.slice(0, 6).map((ingreso) => (
                                    <li key={ingreso.id_ingreso} className={ingreso.estado === 'anulado' ? 'anulado' : ''}>
                                        <span className="etiqueta">{ingreso.departamento}</span>
                                        <span className="flex-grow-1 text-truncate">
                                            {ingreso.concepto}
                                            <small className="secundario">{formatoFecha(ingreso.fecha)} · {capitalizar(ingreso.metodo_pago)}</small>
                                        </span>
                                        <span className="numero fw-semibold monto">{dinero(ingreso.monto)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <a className="panel-pie" href="/ingreso">Ver todos los ingresos <Icono nombre="flecha" tamano={16} /></a>
                    </section>
                </div>
            </div>
        </>
    );
}
