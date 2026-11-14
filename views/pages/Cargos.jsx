import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import { coincide, dinero, formatoFecha, capitalizar, mesLargo, mesAbreviado, mesActual, sumar, cantidad } from '../formato';
import { ESTADOS_CARGO, CONCEPTOS_CARGO } from '../opciones';
import { enlaceFicha } from '../logica/departamentos';
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
import BarraProgreso from '../components/BarraProgreso';
import Modal from '../components/Modal';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import Campo from '../components/Campo';
import Opciones from '../components/Opciones';
import Icono from '../components/Icono';
import ModalGenerarExpensas from '../secciones/ModalGenerarExpensas';

export default function Cargos() {
    const crud = useCrud({
        rutas: { obtener: '/api/cargo/obtenerCargos', guardar: '/api/cargo/guardarCargo', eliminar: '/api/cargo/eliminarCargo' },
        id: 'id_cargo', nombre: 'El cargo', inicial: { Cargos: [], Departamentos: [], DiaVencimiento: 10 }
    });
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [generando, setGenerando] = useState(false);

    const { Cargos: cargos, Departamentos: departamentos, DiaVencimiento: diaVencimiento } = crud.datos;
    const formulario = crud.formulario;

    // Vencimiento propuesto para un mes: el día configurado en el condominio
    const vencimientoDe = (periodo) => periodo ? periodo + '-' + String(diaVencimiento).padStart(2, '0') : '';

    function adicionar() {
        let activos = departamentos.filter((d) => d.estado === 'activo');
        if (activos.length === 0) {
            crud.avisar('warning', 'Primero debe registrar al menos un departamento activo');
            return;
        }
        let periodo = mesActual();
        crud.abrirFormulario({
            id_cargo: 0, id_departamento: activos[0].id_departamento, concepto: '', periodo,
            vencimiento: vencimientoDe(periodo), monto: ''
        });
    }

    function cambiar(e) {
        let cambios = { [e.target.name]: e.target.value };
        // Al cambiar el mes se propone el vencimiento de ese mes
        if (e.target.name === 'periodo') {
            cambios.vencimiento = vencimientoDe(e.target.value);
        }
        crud.actualizarFormulario(cambios);
    }

    async function generar(periodo, dia) {
        let error = await crud.ejecutar('/api/cargo/generarExpensas', { periodo, dia_vencimiento: dia },
            (data) => 'Se emitieron ' + data.Creados + ' expensas de ' + mesLargo(periodo));
        if (error) {
            return error;
        }
        setGenerando(false);
    }

    const periodos = [...new Set(cargos.map((c) => c.periodo))]
        .map((periodo) => ({ valor: periodo, texto: capitalizar(mesLargo(periodo)) }));
    const filtrados = cargos.filter((c) => (filtroEstado === '' || c.estado === filtroEstado)
        && (filtroPeriodo === '' || c.periodo === filtroPeriodo)
        && coincide(busqueda, c.departamento, c.concepto, c.responsable));
    const vencidos = cargos.filter((c) => c.estado === 'vencido');
    const porCobrar = cargos.filter((c) => c.estado === 'pendiente' || c.estado === 'parcial');

    return (
        <>
            <Encabezado titulo="Cuentas por cobrar"
                descripcion="Expensas, multas y demás cargos de cada departamento, con lo pagado y lo que falta cobrar."
                textoBoton="Nuevo cargo" onAdicionar={adicionar}>
                <button className="btn btn-outline-primary" onClick={() => setGenerando(true)}>
                    <Icono nombre="generar" tamano={16} /> Generar expensas
                </button>
            </Encabezado>
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                { etiqueta: 'Total emitido', valor: dinero(sumar(cargos)), detalle: cargos.length + ' cargos' },
                { etiqueta: 'Cobrado', valor: dinero(sumar(cargos, 'pagado')), tono: 'bueno' },
                { etiqueta: 'Por cobrar', valor: dinero(sumar(porCobrar, 'saldo')), detalle: porCobrar.length + ' cargos sin vencer', tono: 'aviso' },
                { etiqueta: 'En mora', valor: dinero(sumar(vencidos, 'saldo')), detalle: cantidad(vencidos.length, 'cargo vencido', 'cargos vencidos'), tono: vencidos.length > 0 ? 'critico' : undefined }
            ]} />

            <PanelTabla mostrados={filtrados.length} total={cargos.length} herramientas={<>
                <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por departamento, concepto o responsable" />
                <Filtro etiqueta="Filtrar por estado" todos="Todos los estados" opciones={ESTADOS_CARGO}
                    valor={filtroEstado} onCambiar={setFiltroEstado} />
                <Filtro etiqueta="Filtrar por mes" todos="Todos los meses" opciones={periodos}
                    valor={filtroPeriodo} onCambiar={setFiltroPeriodo} />
            </>}>
                <thead>
                    <tr>
                        <th>Período</th>
                        <th>Departamento</th>
                        <th>Concepto</th>
                        <th>Responsable</th>
                        <th className="text-end">Monto</th>
                        <th className="columna-progreso">Pagado</th>
                        <th className="text-end">Saldo</th>
                        <th>Estado</th>
                        <th className="text-end columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={9} cargando={crud.cargando} filtrado={cargos.length > 0} />}
                    {filtrados.map((cargo) => (
                        <tr key={cargo.id_cargo}>
                            <td className="text-nowrap">{mesAbreviado(cargo.periodo)}</td>
                            <td><a className="etiqueta enlace-etiqueta" href={enlaceFicha(cargo.id_departamento)}>{cargo.departamento}</a></td>
                            <td className="text-nowrap">
                                {cargo.concepto}
                                <span className="secundario">Vence {formatoFecha(cargo.vencimiento)}</span>
                            </td>
                            <td>{cargo.responsable || <span className="text-body-tertiary">Sin responsable</span>}</td>
                            <td className="text-end numero">{dinero(cargo.monto)}</td>
                            <td className="columna-progreso">
                                <BarraProgreso valor={Number(cargo.pagado)} total={Number(cargo.monto)} />
                                <span className="secundario numero">{dinero(cargo.pagado)}</span>
                            </td>
                            <td className={'text-end numero fw-semibold' + (Number(cargo.saldo) > 0 ? ' texto-deuda' : '')}>{dinero(cargo.saldo)}</td>
                            <td><Estado valor={cargo.estado} /></td>
                            <Acciones onEditar={() => crud.abrirFormulario(cargo)} onEliminar={() => crud.confirmarEliminar(cargo)}>
                                <BotonIcono icono="ficha" titulo="Ver ficha del departamento" href={enlaceFicha(cargo.id_departamento)} />
                            </Acciones>
                        </tr>
                    ))}
                </tbody>
            </PanelTabla>

            {formulario && (
                <Modal titulo={formulario.id_cargo == 0 ? 'Nuevo cargo' : 'Editar cargo'}
                    descripcion="Si el departamento tiene saldo a favor, se aplica automáticamente a este cargo."
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Departamento" requerido ancho="col-md-6"
                            ayuda={formulario.id_cargo != 0 ? 'El departamento de un cargo no se puede cambiar' : undefined}>
                            <select name="id_departamento" className="form-select" value={formulario.id_departamento}
                                disabled={formulario.id_cargo != 0} onChange={cambiar}>
                                <Opciones lista={departamentos} valor="id_departamento" texto="numero" />
                            </select>
                        </Campo>
                        <Campo etiqueta="Concepto" requerido ancho="col-md-6">
                            <input name="concepto" className="form-control" maxLength="180" list="conceptos-cargo" placeholder="Ej. Multa"
                                autoFocus value={formulario.concepto} onChange={cambiar} />
                        </Campo>
                        <datalist id="conceptos-cargo">
                            {CONCEPTOS_CARGO.map((concepto) => <option key={concepto} value={concepto} />)}
                        </datalist>
                        <Campo etiqueta="Mes" requerido ancho="col-md-6">
                            <input name="periodo" type="month" className="form-control" value={formulario.periodo} onChange={cambiar} />
                        </Campo>
                        <Campo etiqueta="Vencimiento" requerido ancho="col-md-6">
                            <input name="vencimiento" type="date" className="form-control" value={formulario.vencimiento} onChange={cambiar} />
                        </Campo>
                        <Campo etiqueta="Monto (Bs)" requerido>
                            <input name="monto" type="number" step="0.01" min="0" className="form-control" placeholder="0.00"
                                value={formulario.monto} onChange={cambiar} />
                        </Campo>
                    </div>
                </Modal>
            )}

            {crud.aEliminar && (
                <ConfirmarEliminar titulo="Eliminar cargo" onCerrar={crud.cancelarEliminar} onAceptar={crud.eliminar}>
                    ¿Está seguro que desea eliminar el cargo <b>{crud.aEliminar.concepto} {mesLargo(crud.aEliminar.periodo)}</b> del
                    departamento <b>{crud.aEliminar.departamento}</b>? Solo se pueden eliminar cargos sin pagos.
                </ConfirmarEliminar>
            )}

            {generando && (
                <ModalGenerarExpensas departamentos={departamentos} cargos={cargos} diaVencimiento={diaVencimiento}
                    onCerrar={() => setGenerando(false)} onConfirmar={generar} />
            )}
        </>
    );
}
