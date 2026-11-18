import { useState, useEffect, useRef } from 'react';
import useCrud from '../hooks/useCrud';
import { parametro } from '../ruta';
import { coincide, dinero, formatoFecha, capitalizar, hoy, mesActual, sumar, numeroRecibo, textoAnulacion } from '../formato';
import { ESTADOS_MOVIMIENTO, METODOS_PAGO } from '../opciones';
import { tipoSugerido } from '../logica/pagos';
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
        id: 'id_ingreso', nombre: 'El pago', inicial: { Ingresos: [], Departamentos: [], Tipos: [], Pendientes: [] },
        accionAlCrear: (id) => ({ texto: 'Ver e imprimir el recibo', href: '/ingreso/comprobante?id=' + id })
    });
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMetodo, setFiltroMetodo] = useState('');
    const [aAnular, setAAnular] = useState(null);   // pago que se va a anular

    const { Ingresos: ingresos, Departamentos: departamentos, Tipos: tipos, Pendientes: pendientes } = crud.datos;
    const formulario = crud.formulario;

    // Propone el primer departamento (y a su propietario como quien paga); si el condominio aún no
    // tiene ninguno, queda como ingreso del condominio
    function adicionar(idDepartamento) {
        let id = idDepartamento || (departamentos.length > 0 ? departamentos[0].id_departamento : '');
        let departamento = departamentos.find((d) => d.id_departamento == id);
        crud.abrirFormulario({
            id_ingreso: 0, id_departamento: id,
            id_tipo_ingreso: tipoSugerido(tipos, id !== ''),
            concepto: id === '' ? '' : 'Pago de expensas', monto: '',
            fecha: hoy(), metodo_pago: 'efectivo', referencia: '', aplica_deuda: id !== '', meses_adelantados: 0,
            pagador: departamento ? departamento.propietario : '',
            pagador_documento: departamento ? departamento.documento_propietario : ''
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
            'El recibo se anuló y lo que cubría volvió a quedar pendiente');
        if (error) {
            return error;
        }
        setAAnular(null);
    }

    const registrados = ingresos.filter((i) => i.estado === 'registrado');
    const filtrados = ingresos.filter((i) => (filtroEstado === '' || i.estado === filtroEstado)
        && (filtroMetodo === '' || i.metodo_pago === filtroMetodo)
        && coincide(busqueda, i.concepto, i.departamento, i.tipo_ingreso, i.pagador, numeroRecibo(i.numero)));
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
                { etiqueta: 'Deuda pendiente', valor: dinero(sumar(pendientes, 'saldo')), tono: pendientes.length > 0 ? 'critico' : undefined, ayuda: 'deudaTotal' },
                { etiqueta: 'Saldos a favor', valor: dinero(sumar(departamentos, 'saldo_favor')), detalle: 'Pagos adelantados sin aplicar', ayuda: 'saldoFavor' }
            ]} />

            <PanelTabla mostrados={filtrados.length} total={ingresos.length} herramientas={<>
                <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por recibo, departamento, concepto o quien pagó" />
                <Filtro etiqueta="Filtrar por estado" todos="Todos los estados" opciones={ESTADOS_MOVIMIENTO}
                    valor={filtroEstado} onCambiar={setFiltroEstado} />
                <Filtro etiqueta="Filtrar por método de pago" todos="Todos los métodos" opciones={METODOS_PAGO}
                    valor={filtroMetodo} onCambiar={setFiltroMetodo} />
            </>}>
                <thead>
                    <tr>
                        <th>Recibo</th>
                        <th>Departamento</th>
                        <th>Concepto</th>
                        <th>Cubre</th>
                        <th className="text-end">Monto</th>
                        <th>Estado</th>
                        <th className="text-end columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={7} cargando={crud.cargando} filtrado={ingresos.length > 0}
                        titulo="Todavía no se registró ningún pago"
                        texto="Cada pago genera su recibo numerado y se aplica primero a la deuda más antigua del departamento."
                        accion={{ texto: 'Registrar el primer pago', onClick: () => adicionar() }} />}
                    {filtrados.map((ingreso) => (
                        <tr key={ingreso.id_ingreso} className={ingreso.estado === 'anulado' ? 'anulado' : ''}>
                            <td className="text-nowrap">
                                <span className="numero fw-semibold">Nº {numeroRecibo(ingreso.numero)}</span>
                                <span className="secundario">{formatoFecha(ingreso.fecha)}</span>
                            </td>
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
                                {ingreso.motivo_anulacion && <span className="secundario" title={textoAnulacion(ingreso)}>{ingreso.motivo_anulacion}</span>}
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
                <Modal titulo={formulario.id_ingreso == 0 ? 'Registrar pago' : 'Corregir recibo Nº ' + numeroRecibo(formulario.numero)} tamano="lg"
                    textoAceptar={formulario.id_ingreso == 0 ? 'Registrar pago' : 'Guardar cambios'}
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <FormularioPago formulario={formulario} cambiar={crud.cambiar} actualizar={crud.actualizarFormulario}
                        departamentos={departamentos} tipos={tipos} pendientes={pendientes} />
                </Modal>
            )}

            {aAnular && (
                <ModalAnular titulo="Anular recibo" placeholder="Ej. Depósito rechazado por el banco"
                    descripcion="El recibo queda en el historial como anulado, con su motivo y quién lo anuló, y lo que cubría vuelve a quedar pendiente."
                    onCerrar={() => setAAnular(null)} onConfirmar={anular}>
                    Recibo Nº <b>{numeroRecibo(aAnular.numero)}</b> por <b>{dinero(aAnular.monto)}</b>
                    {aAnular.departamento ? <> del departamento <b>{aAnular.departamento}</b></> : ' (ingreso del condominio)'}
                    {' '}del {formatoFecha(aAnular.fecha)}.
                </ModalAnular>
            )}
        </>
    );
}
