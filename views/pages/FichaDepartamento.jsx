import { useState } from 'react';
import useDatos from '../hooks/useDatos';
import { enviar } from '../api';
import { parametro } from '../ruta';
import { dinero, decimal, formatoFecha, capitalizar, mesLargo, sumar } from '../formato';
import { ocupacion } from '../logica/departamentos';
import { textoSalida } from '../logica/residentes';
import Resumen from '../components/Resumen';
import Pestanas from '../components/Pestanas';
import Estado from '../components/Estado';
import Icono from '../components/Icono';
import Nota from '../components/Nota';
import BotonIcono from '../components/BotonIcono';
import BarraProgreso from '../components/BarraProgreso';
import SinDatos from '../components/SinDatos';
import Cargando from '../components/Cargando';
import Alerta from '../components/Alerta';
import ModalTraspaso from '../secciones/ModalTraspaso';

const idDepartamento = parametro('id');

// Deuda pendiente agrupada por el responsable de cada cargo (normalmente el propietario actual)
function deudaPorResponsable(cargos) {
    let grupos = {};
    cargos.filter((c) => Number(c.saldo) > 0).forEach((c) => {
        let nombre = c.responsable || 'Sin responsable';
        grupos[nombre] = (grupos[nombre] || 0) + Number(c.saldo);
    });
    return Object.entries(grupos).map(([nombre, deuda]) => ({ nombre, deuda }));
}

export default function FichaDepartamento() {
    const ficha = useDatos('/api/departamento/obtenerFicha?id_departamento=' + idDepartamento, null);
    // Departamentos y personas para el formulario de traspaso
    const datosTraspaso = useDatos('/api/traspaso/obtenerTraspasos', { Traspasos: [], Departamentos: [], Personas: [] });
    const [pestana, setPestana] = useState('cuenta');
    const [traspasando, setTraspasando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    async function traspasar(datos) {
        let resultado = await enviar('/api/traspaso/realizarTraspaso', datos);
        if (!resultado.Success) {
            return resultado.Mensaje;
        }
        setTraspasando(false);
        setMensaje({ tipo: 'success', texto: 'El traspaso se registró correctamente' });
        ficha.recargar();
        datosTraspaso.recargar();
    }

    if (!ficha.datos) {
        return <Cargando texto="Cargando la ficha..." error={ficha.error} />;
    }

    const { Departamento: departamento, Cargos: cargos, Pagos: pagos, Residentes: residentes, Traspasos: traspasos } = ficha.datos;
    const pagosRegistrados = pagos.filter((p) => p.estado === 'registrado');
    const vencidos = cargos.filter((c) => c.estado === 'vencido');
    const deudores = deudaPorResponsable(cargos);
    const estadoOcupacion = ocupacion(departamento);

    return (
        <>
            <a className="volver no-imprimir" href="/departamento"><Icono nombre="volver" tamano={16} /> Departamentos</a>
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <section className="panel ficha-cabecera">
                <div className="ficha-numero"><Icono nombre="departamentos" tamano={26} /></div>
                <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <h1>Departamento {departamento.numero}</h1>
                        <Estado valor={departamento.estado} />
                        {estadoOcupacion && <Estado valor={estadoOcupacion} />}
                    </div>
                    <p>
                        {departamento.tipo_departamento} · Piso {departamento.piso} · {decimal(departamento.metros_cuadrados)} m²
                        · Propietario: <strong>{departamento.propietario || 'sin registrar'}</strong>
                    </p>
                </div>
                <div className="encabezado-acciones no-imprimir">
                    <button className="btn btn-light" onClick={() => window.print()}>
                        <Icono nombre="imprimir" tamano={16} /> Imprimir
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => setTraspasando(true)} disabled={datosTraspaso.cargando}>
                        <Icono nombre="traspaso" tamano={16} /> Traspasar propiedad
                    </button>
                    <a className="btn btn-primary" href={'/ingreso?departamento=' + departamento.id_departamento}>
                        <Icono nombre="ingresos" tamano={16} /> Registrar pago
                    </a>
                </div>
            </section>

            <Resumen items={[
                {
                    etiqueta: 'Deuda pendiente', valor: dinero(departamento.deuda),
                    detalle: vencidos.length > 0 ? vencidos.length + ' cargos vencidos' : 'Sin cargos vencidos',
                    tono: Number(departamento.deuda) > 0 ? 'critico' : 'bueno'
                },
                { etiqueta: 'Saldo a favor', valor: dinero(departamento.saldo_favor), tono: Number(departamento.saldo_favor) > 0 ? 'bueno' : undefined },
                { etiqueta: 'Cuota mensual', valor: dinero(departamento.cuota_mensual) },
                {
                    etiqueta: 'Total pagado', valor: dinero(sumar(pagosRegistrados)),
                    detalle: pagosRegistrados.length > 0 ? 'Último pago: ' + formatoFecha(pagosRegistrados[0].fecha) : 'Sin pagos registrados'
                }
            ]} />

            <div className="no-imprimir">
                <Pestanas activa={pestana} onCambiar={setPestana} pestanas={[
                    { clave: 'cuenta', texto: 'Estado de cuenta', contador: cargos.length },
                    { clave: 'pagos', texto: 'Pagos', contador: pagos.length },
                    { clave: 'residentes', texto: 'Residentes', contador: residentes.length },
                    { clave: 'propietarios', texto: 'Historial de propietarios', contador: traspasos.length }
                ]} />
            </div>

            {pestana === 'cuenta' && (
                <section className="panel panel-tabla">
                    <div className="table-responsive">
                        <table className="table tabla">
                            <thead>
                                <tr>
                                    <th>Período</th>
                                    <th>Concepto</th>
                                    <th>Responsable</th>
                                    <th className="text-end">Monto</th>
                                    <th className="columna-progreso">Pagado</th>
                                    <th className="text-end">Saldo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargos.length === 0 && <SinDatos columnas={7} />}
                                {cargos.map((cargo) => (
                                    <tr key={cargo.id_cargo}>
                                        <td className="text-nowrap">{capitalizar(mesLargo(cargo.periodo))}</td>
                                        <td>{cargo.concepto}<span className="secundario">Vence {formatoFecha(cargo.vencimiento)}</span></td>
                                        <td>{cargo.responsable || <span className="text-body-tertiary">Sin responsable</span>}</td>
                                        <td className="text-end numero">{dinero(cargo.monto)}</td>
                                        <td className="columna-progreso">
                                            <BarraProgreso valor={Number(cargo.pagado)} total={Number(cargo.monto)} />
                                            <span className="secundario numero">{dinero(cargo.pagado)}</span>
                                        </td>
                                        <td className={'text-end numero fw-semibold' + (Number(cargo.saldo) > 0 ? ' texto-deuda' : '')}>{dinero(cargo.saldo)}</td>
                                        <td><Estado valor={cargo.estado} /></td>
                                    </tr>
                                ))}
                            </tbody>
                            {cargos.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <th colSpan={3} className="text-end">Totales</th>
                                        <th className="text-end numero">{dinero(sumar(cargos))}</th>
                                        <th className="numero">{dinero(sumar(cargos, 'pagado'))}</th>
                                        <th className="text-end numero">{dinero(sumar(cargos, 'saldo'))}</th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </section>
            )}

            {pestana === 'pagos' && (
                <section className="panel panel-tabla">
                    <div className="table-responsive">
                        <table className="table tabla">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Método</th>
                                    <th className="text-end">Monto</th>
                                    <th>Estado</th>
                                    <th className="text-end">Comprobante</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.length === 0 && <SinDatos columnas={6} />}
                                {pagos.map((pago) => (
                                    <tr key={pago.id_ingreso} className={pago.estado === 'anulado' ? 'anulado' : ''}>
                                        <td className="text-nowrap">{formatoFecha(pago.fecha)}</td>
                                        <td>{pago.concepto}<span className="secundario">{pago.tipo_ingreso}</span></td>
                                        <td>{capitalizar(pago.metodo_pago)}</td>
                                        <td className="text-end">
                                            <span className="numero fw-semibold monto">{dinero(pago.monto)}</span>
                                            {Number(pago.a_favor) > 0 && <span className="secundario sube">{dinero(pago.a_favor)} a favor</span>}
                                        </td>
                                        <td><Estado valor={pago.estado} /></td>
                                        <td className="text-end">
                                            <BotonIcono icono="recibo" titulo="Ver comprobante" href={'/ingreso/comprobante?id=' + pago.id_ingreso} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {pestana === 'residentes' && (
                <section className="panel panel-tabla">
                    <div className="table-responsive">
                        <table className="table tabla">
                            <thead>
                                <tr>
                                    <th>Persona</th>
                                    <th>Relación</th>
                                    <th>Vigencia</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residentes.length === 0 && <SinDatos columnas={4} />}
                                {residentes.map((residente) => (
                                    <tr key={residente.id_residente}>
                                        <td><strong>{residente.persona}</strong></td>
                                        <td>{capitalizar(residente.tipo_relacion)}</td>
                                        <td className="text-nowrap">
                                            Desde {formatoFecha(residente.fecha_inicio)}
                                            <span className="secundario">{textoSalida(residente)}</span>
                                        </td>
                                        <td><Estado valor={residente.estado} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {pestana === 'propietarios' && (
                <div className="row g-4">
                    <div className="col-lg-7">
                        <section className="panel h-100">
                            <div className="panel-cabecera">
                                <div><h2>Traspasos de propiedad</h2><p>Del más reciente al más antiguo</p></div>
                            </div>
                            {traspasos.length === 0 ? (
                                <div className="panel-vacio">Este departamento no tiene traspasos registrados.</div>
                            ) : (
                                <ol className="linea-tiempo">
                                    {traspasos.map((traspaso) => (
                                        <li key={traspaso.id_traspaso}>
                                            <span className="linea-tiempo-fecha">{formatoFecha(traspaso.fecha)}</span>
                                            <div>
                                                <strong>{traspaso.propietario_anterior || 'Sin propietario'}</strong> → <strong>{traspaso.propietario_nuevo}</strong>
                                                <span className="secundario">
                                                    {Number(traspaso.deuda_pendiente) > 0
                                                        ? 'Deuda transferida al nuevo propietario: ' + dinero(traspaso.deuda_pendiente)
                                                        : 'Sin deuda al momento del traspaso'}
                                                    {traspaso.observacion && ' · ' + traspaso.observacion}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </div>
                    <div className="col-lg-5">
                        <section className="panel h-100">
                            <div className="panel-cabecera">
                                <div><h2>Deuda por responsable</h2><p>Con cada traspaso, la deuda pendiente pasa al nuevo propietario</p></div>
                            </div>
                            <div className="panel-cuerpo">
                                {deudores.length === 0 ? (
                                    <Nota tono="bueno">Ningún propietario tiene deudas pendientes en este departamento.</Nota>
                                ) : (
                                    <ul className="be-leyenda">
                                        {deudores.map((d) => (
                                            <li key={d.nombre}>
                                                <span className="avatar">{d.nombre.charAt(0)}</span>
                                                <span className="flex-grow-1">{d.nombre}</span>
                                                <span className="numero fw-semibold texto-deuda">{dinero(d.deuda)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {/* Solo se ofrece este departamento: el traspaso se hace desde su propia ficha */}
            {traspasando && (
                <ModalTraspaso personas={datosTraspaso.datos.Personas} idDepartamento={departamento.id_departamento}
                    departamentos={datosTraspaso.datos.Departamentos.filter((d) => d.id_departamento == departamento.id_departamento)}
                    onCerrar={() => setTraspasando(false)} onConfirmar={traspasar} />
            )}
        </>
    );
}
