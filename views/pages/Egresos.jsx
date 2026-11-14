import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import { coincide, dinero, formatoFecha, capitalizar, hoy, mesActual, mesLargo, sumar } from '../formato';
import { ESTADOS_MOVIMIENTO, METODOS_PAGO } from '../opciones';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Resumen from '../components/Resumen';
import PanelTabla from '../components/PanelTabla';
import Buscador from '../components/Buscador';
import Filtro from '../components/Filtro';
import SinDatos from '../components/SinDatos';
import Estado from '../components/Estado';
import Acciones from '../components/Acciones';
import BotonIcono from '../components/BotonIcono';
import Modal from '../components/Modal';
import Campo from '../components/Campo';
import Opciones from '../components/Opciones';
import Nota from '../components/Nota';
import ModalAnular from '../secciones/ModalAnular';

export default function Egresos() {
    const crud = useCrud({
        rutas: { obtener: '/api/egreso/obtenerEgresos', guardar: '/api/egreso/guardarEgreso' },
        id: 'id_egreso', nombre: 'El gasto',
        inicial: { Egresos: [], Tipos: [], Caja: { ingresos: 0, egresos: 0, ingresos_mes: 0, egresos_mes: 0, saldo: 0 } }
    });
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [aAnular, setAAnular] = useState(null);   // gasto que se va a anular

    const { Egresos: egresos, Tipos: tipos, Caja: caja } = crud.datos;
    const formulario = crud.formulario;

    function adicionar() {
        crud.abrirFormulario({
            id_egreso: 0, id_tipo_egreso: tipos.length > 0 ? tipos[0].id_tipo_egreso : '', concepto: '', proveedor: '',
            numero_documento: '', monto: '', fecha: hoy(), metodo_pago: 'efectivo', observacion: ''
        });
    }

    async function anular(motivo) {
        let error = await crud.ejecutar('/api/egreso/anularEgreso', { id_egreso: aAnular.id_egreso, motivo },
            'El gasto se anuló y su monto volvió a la caja');
        if (error) {
            return error;
        }
        setAAnular(null);
    }

    // Dinero disponible para este gasto: el saldo en caja (al editar, más lo que ya ocupaba este gasto)
    function disponible() {
        let original = egresos.find((e) => e.id_egreso == formulario.id_egreso);
        return Number(caja.saldo) + (original ? Number(original.monto) : 0);
    }

    const saldo = Number(caja.saldo);
    const resultadoMes = Number(caja.ingresos_mes) - Number(caja.egresos_mes);
    const opcionesTipo = tipos.map((t) => ({ valor: String(t.id_tipo_egreso), texto: t.nombre }));
    const filtrados = egresos.filter((e) => (filtroEstado === '' || e.estado === filtroEstado)
        && (filtroTipo === '' || String(e.id_tipo_egreso) === filtroTipo)
        && coincide(busqueda, e.concepto, e.proveedor, e.numero_documento, e.tipo_egreso));
    const totalFiltrado = sumar(filtrados.filter((e) => e.estado === 'registrado'));
    const tipoElegido = formulario ? tipos.find((t) => t.id_tipo_egreso == formulario.id_tipo_egreso) : null;

    return (
        <>
            <Encabezado titulo="Gastos"
                descripcion="Pagos del condominio a proveedores y personal. Cada gasto descuenta del saldo en caja."
                textoBoton="Registrar gasto" onAdicionar={adicionar} />
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                {
                    etiqueta: 'Saldo en caja', valor: dinero(saldo), detalle: 'Ingresos menos gastos registrados',
                    tono: saldo < 0 ? 'critico' : 'bueno'
                },
                { etiqueta: 'Gastado en ' + mesLargo(mesActual()), valor: dinero(caja.egresos_mes) },
                {
                    etiqueta: resultadoMes >= 0 ? 'Ganancia del mes' : 'Pérdida del mes', valor: dinero(Math.abs(resultadoMes)),
                    detalle: 'Ingresos ' + dinero(caja.ingresos_mes) + ' · Gastos ' + dinero(caja.egresos_mes),
                    tono: resultadoMes < 0 ? 'critico' : undefined
                },
                { etiqueta: 'Total gastado', valor: dinero(caja.egresos), detalle: 'Desde el inicio' }
            ]} />

            <PanelTabla mostrados={filtrados.length} total={egresos.length} herramientas={<>
                <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por concepto, proveedor o factura" />
                <Filtro etiqueta="Filtrar por tipo" todos="Todos los tipos" opciones={opcionesTipo}
                    valor={filtroTipo} onCambiar={setFiltroTipo} />
                <Filtro etiqueta="Filtrar por estado" todos="Todos los estados" opciones={ESTADOS_MOVIMIENTO}
                    valor={filtroEstado} onCambiar={setFiltroEstado} />
            </>}>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Pagado a</th>
                        <th>Método</th>
                        <th className="text-end">Monto</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={7} cargando={crud.cargando} filtrado={egresos.length > 0} />}
                    {filtrados.map((egreso) => (
                        <tr key={egreso.id_egreso} className={egreso.estado === 'anulado' ? 'anulado' : ''}>
                            <td className="text-nowrap">{formatoFecha(egreso.fecha)}</td>
                            <td>
                                {egreso.concepto}
                                <span className="secundario">{egreso.tipo_egreso}</span>
                            </td>
                            <td>
                                {egreso.proveedor || <span className="text-body-tertiary">—</span>}
                                {egreso.numero_documento && <span className="secundario">Doc. {egreso.numero_documento}</span>}
                            </td>
                            <td>{capitalizar(egreso.metodo_pago)}</td>
                            <td className="text-end numero fw-semibold monto">{dinero(egreso.monto)}</td>
                            <td>
                                <Estado valor={egreso.estado} />
                                {egreso.motivo_anulacion && <span className="secundario" title={egreso.motivo_anulacion}>{egreso.motivo_anulacion}</span>}
                            </td>
                            <Acciones onEditar={egreso.estado === 'registrado' ? () => crud.abrirFormulario(egreso) : undefined}
                                onEliminar={egreso.estado === 'registrado' ? () => setAAnular(egreso) : undefined}
                                tituloEliminar="Anular" iconoEliminar="anular">
                                <BotonIcono icono="recibo" titulo="Ver comprobante" href={'/egreso/comprobante?id=' + egreso.id_egreso} />
                            </Acciones>
                        </tr>
                    ))}
                </tbody>
                {filtrados.length > 0 && (
                    <tfoot>
                        <tr>
                            <th colSpan={4} className="text-end">Total registrado</th>
                            <th className="text-end numero">{dinero(totalFiltrado)}</th>
                            <th colSpan={2}></th>
                        </tr>
                    </tfoot>
                )}
            </PanelTabla>

            {formulario && (
                <Modal titulo={formulario.id_egreso == 0 ? 'Registrar gasto' : 'Editar gasto'}
                    textoAceptar={formulario.id_egreso == 0 ? 'Registrar gasto' : 'Guardar cambios'}
                    descripcion="Guarde el número de factura o recibo del proveedor como respaldo."
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Tipo de gasto" requerido ancho="col-md-6" ayuda={tipoElegido ? tipoElegido.descripcion : undefined}>
                            <select name="id_tipo_egreso" className="form-select" value={formulario.id_tipo_egreso} onChange={crud.cambiar}>
                                <Opciones lista={tipos} valor="id_tipo_egreso" texto="nombre" />
                            </select>
                        </Campo>
                        <Campo etiqueta="Fecha" requerido ancho="col-md-6">
                            <input name="fecha" type="date" className="form-control" value={formulario.fecha} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Concepto" requerido>
                            <input name="concepto" className="form-control" maxLength="180" placeholder="Ej. Mantenimiento mensual del ascensor"
                                autoFocus value={formulario.concepto} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Pagado a (proveedor o persona)" ancho="col-md-7">
                            <input name="proveedor" className="form-control" maxLength="150" placeholder="Ej. Ascensores del Oriente SRL"
                                value={formulario.proveedor} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Nº de factura o recibo" ancho="col-md-5">
                            <input name="numero_documento" className="form-control" maxLength="50" placeholder="Ej. 001234"
                                value={formulario.numero_documento} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Monto (Bs)" requerido ancho="col-md-6">
                            <input name="monto" type="number" step="0.01" min="0" className="form-control monto-entrada" placeholder="0.00"
                                value={formulario.monto} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Método de pago" requerido ancho="col-md-6">
                            <select name="metodo_pago" className="form-select" value={formulario.metodo_pago} onChange={crud.cambiar}>
                                <Opciones lista={METODOS_PAGO} />
                            </select>
                        </Campo>
                        <Campo etiqueta="Observación">
                            <textarea name="observacion" className="form-control" rows="2" maxLength="250"
                                value={formulario.observacion} onChange={crud.cambiar} />
                        </Campo>
                        <div className="col-12">
                            {Number(formulario.monto) > disponible() ? (
                                <Nota tono="aviso" titulo={'El gasto supera el saldo en caja (' + dinero(disponible()) + ')'}>
                                    Se puede registrar igual (por ejemplo, si se paga con un fondo de reserva), pero la caja quedará en negativo.
                                </Nota>
                            ) : (
                                <Nota tono="info">Saldo disponible en caja: <b>{dinero(disponible())}</b></Nota>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {aAnular && (
                <ModalAnular titulo="Anular gasto" placeholder="Ej. Se registró dos veces"
                    descripcion="El gasto queda en el historial como anulado y su monto vuelve a la caja."
                    onCerrar={() => setAAnular(null)} onConfirmar={anular}>
                    Gasto de <b>{dinero(aAnular.monto)}</b> por <b>{aAnular.concepto}</b> del {formatoFecha(aAnular.fecha)}.
                </ModalAnular>
            )}
        </>
    );
}
