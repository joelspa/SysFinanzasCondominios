import { useState, useEffect, useRef } from 'react';
import useCrud from '../hooks/useCrud';
import { parametro } from '../ruta';
import { coincide, dinero, formatoFecha, capitalizar, hoy, mesActual, sumar } from '../formato';
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
import ModalAnular from '../secciones/ModalAnular';
import FormularioPago from '../secciones/FormularioPago';
import AplicacionesPago from '../secciones/AplicacionesPago';

export default function Ingresos() {
    const crud = useCrud({
        rutas: { obtener: '/api/ingreso/obtenerIngresos', guardar: '/api/ingreso/guardarIngreso' },
        id: 'id_ingreso', nombre: 'El pago', inicial: { Ingresos: [], Departamentos: [], Tipos: [], Pendientes: [] }
    });
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMetodo, setFiltroMetodo] = useState('');
    const [aAnular, setAAnular] = useState(null);   // pago que se va a anular

    const { Ingresos: ingresos, Departamentos: departamentos, Tipos: tipos, Pendientes: pendientes } = crud.datos;
    const formulario = crud.formulario;

    // Propone el primer departamento; si el condominio aún no tiene ninguno, queda como ingreso del condominio
    function adicionar(idDepartamento) {
        let departamento = idDepartamento || (departamentos.length > 0 ? departamentos[0].id_departamento : '');
        crud.abrirFormulario({
            id_ingreso: 0, id_departamento: departamento,
            id_tipo_ingreso: tipos.length > 0 ? tipos[0].id_tipo_ingreso : '',
            concepto: departamento === '' ? '' : 'Pago de expensas', monto: '',
            fecha: hoy(), metodo_pago: 'efectivo', aplica_deuda: departamento !== '', meses_adelantados: 0
        });
    }

    // Desde la ficha de un departamento se llega con ?departamento=ID para registrar su pago
    const preseleccion = useRef(parametro('departamento'));
    useEffect(() => {
        if (!crud.cargando && preseleccion.current) {
            adicionar(preseleccion.current);
            preseleccion.current = null;
        }
    }, [crud.cargando]);

    async function anular(motivo) {
        let error = await crud.ejecutar('/api/ingreso/anularIngreso', { id_ingreso: aAnular.id_ingreso, motivo },
            'El pago se anuló y su monto volvió a la deuda');
        if (error) {
            return error;
        }
        setAAnular(null);
    }

    const registrados = ingresos.filter((i) => i.estado === 'registrado');
    const filtrados = ingresos.filter((i) => (filtroEstado === '' || i.estado === filtroEstado)
        && (filtroMetodo === '' || i.metodo_pago === filtroMetodo)
        && coincide(busqueda, i.concepto, i.departamento, i.tipo_ingreso));
    const totalFiltrado = sumar(filtrados.filter((i) => i.estado === 'registrado'));

    return (
        <>
            <Encabezado titulo="Ingresos"
                descripcion="Dinero que entra al condominio. Cada pago de un departamento cubre primero sus deudas más antiguas; lo que sobra queda a favor."
                textoBoton="Registrar pago" onAdicionar={() => adicionar()} />
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                { etiqueta: 'Recaudado este mes', valor: dinero(sumar(registrados.filter((i) => i.fecha.startsWith(mesActual())))) },
                { etiqueta: 'Total recaudado', valor: dinero(sumar(registrados)), detalle: registrados.length + (registrados.length === 1 ? ' pago registrado' : ' pagos registrados') },
                { etiqueta: 'Deuda pendiente', valor: dinero(sumar(pendientes, 'saldo')), tono: pendientes.length > 0 ? 'critico' : undefined },
                { etiqueta: 'Saldos a favor', valor: dinero(sumar(departamentos, 'saldo_favor')), detalle: 'Pagos adelantados sin aplicar' }
            ]} />

            <PanelTabla mostrados={filtrados.length} total={ingresos.length} herramientas={<>
                <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por concepto, departamento o tipo" />
                <Filtro etiqueta="Filtrar por estado" todos="Todos los estados" opciones={ESTADOS_MOVIMIENTO}
                    valor={filtroEstado} onCambiar={setFiltroEstado} />
                <Filtro etiqueta="Filtrar por método de pago" todos="Todos los métodos" opciones={METODOS_PAGO}
                    valor={filtroMetodo} onCambiar={setFiltroMetodo} />
            </>}>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Departamento</th>
                        <th>Concepto</th>
                        <th>Cubre</th>
                        <th className="text-end">Monto</th>
                        <th>Estado</th>
                        <th className="text-end columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={7} cargando={crud.cargando} filtrado={ingresos.length > 0} />}
                    {filtrados.map((ingreso) => (
                        <tr key={ingreso.id_ingreso} className={ingreso.estado === 'anulado' ? 'anulado' : ''}>
                            <td className="text-nowrap">{formatoFecha(ingreso.fecha)}</td>
                            <td>
                                {ingreso.departamento
                                    ? <span className="etiqueta">{ingreso.departamento}</span>
                                    : <span className="text-body-tertiary small">Condominio</span>}
                            </td>
                            <td>
                                {ingreso.concepto}
                                <span className="secundario">{ingreso.tipo_ingreso} · {capitalizar(ingreso.metodo_pago)}</span>
                            </td>
                            <td><AplicacionesPago ingreso={ingreso} /></td>
                            <td className="text-end">
                                <span className="numero fw-semibold monto">{dinero(ingreso.monto)}</span>
                                {Number(ingreso.a_favor) > 0 && <span className="secundario sube">{dinero(ingreso.a_favor)} a favor</span>}
                            </td>
                            <td>
                                <Estado valor={ingreso.estado} />
                                {ingreso.motivo_anulacion && <span className="secundario" title={ingreso.motivo_anulacion}>{ingreso.motivo_anulacion}</span>}
                            </td>
                            <Acciones onEditar={ingreso.estado === 'registrado' ? () => crud.abrirFormulario(ingreso) : undefined}
                                onEliminar={ingreso.estado === 'registrado' ? () => setAAnular(ingreso) : undefined}
                                tituloEliminar="Anular" iconoEliminar="anular">
                                <BotonIcono icono="recibo" titulo="Ver comprobante" href={'/ingreso/comprobante?id=' + ingreso.id_ingreso} />
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
                <Modal titulo={formulario.id_ingreso == 0 ? 'Registrar pago' : 'Editar pago'} tamano="lg"
                    textoAceptar={formulario.id_ingreso == 0 ? 'Registrar pago' : 'Guardar cambios'}
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <FormularioPago formulario={formulario} cambiar={crud.cambiar} actualizar={crud.actualizarFormulario}
                        departamentos={departamentos} tipos={tipos} pendientes={pendientes} />
                </Modal>
            )}

            {aAnular && (
                <ModalAnular titulo="Anular pago" placeholder="Ej. Depósito rechazado por el banco"
                    descripcion="El pago queda en el historial como anulado y su monto vuelve a la deuda del departamento."
                    onCerrar={() => setAAnular(null)} onConfirmar={anular}>
                    Pago de <b>{dinero(aAnular.monto)}</b>
                    {aAnular.departamento ? <> del departamento <b>{aAnular.departamento}</b></> : ' (ingreso del condominio)'}
                    {' '}del {formatoFecha(aAnular.fecha)}.
                </ModalAnular>
            )}
        </>
    );
}
