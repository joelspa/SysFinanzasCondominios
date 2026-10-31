import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import { coincide, dinero, formatoFecha, capitalizar, hoy, sumar, mesLargo } from '../formato';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import Estado from '../components/Estado';
import SinDatos from '../components/SinDatos';
import Resumen from '../components/Resumen';
import Buscador from '../components/Buscador';

const metodosPago = ['efectivo', 'transferencia', 'QR', 'tarjeta'];

export default function Ingresos() {
    const [ingresos, setIngresos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMetodo, setFiltroMetodo] = useState('');
    const [formulario, setFormulario] = useState(null);   // ingreso que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // ingreso que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/ingreso/obtenerIngresos');
        setCargando(false);
        if (resultado.Success) {
            setIngresos(resultado.Data.Ingresos);
            setDepartamentos(resultado.Data.Departamentos);
            setTipos(resultado.Data.Tipos);
            setCargos(resultado.Data.Cargos);
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    useEffect(() => { cargar(); }, []);

    function abrirFormulario(ingreso) {
        setError('');
        setFormulario(sinNulos(ingreso));
    }

    function adicionar() {
        if (departamentos.length === 0) {
            setMensaje({ tipo: 'warning', texto: 'Primero debe registrar al menos un departamento' });
            return;
        }
        abrirFormulario({
            id_ingreso: 0, id_departamento: departamentos[0].id_departamento, id_cargo: '',
            id_tipo_ingreso: tipos.length > 0 ? tipos[0].id_tipo_ingreso : '', concepto: '', monto: '',
            fecha: hoy(), metodo_pago: 'efectivo', estado: 'registrado'
        });
    }

    function cambiar(e) {
        let cambios = { [e.target.name]: e.target.value };
        if (e.target.name === 'id_departamento') {
            // Los cargos son de cada departamento: al cambiarlo se quita el cargo elegido
            cambios.id_cargo = '';
        }
        if (e.target.name === 'id_cargo' && e.target.value !== '') {
            // Al elegir un cargo se copian su concepto y su monto
            let cargo = cargos.find((c) => c.id_cargo == e.target.value);
            cambios.concepto = cargo.concepto + ' ' + cargo.periodo;
            cambios.monto = cargo.monto;
        }
        setFormulario({ ...formulario, ...cambios });
    }

    // Cargos del departamento elegido que aún no se pagaron (o el que ya tenía este ingreso)
    function cargosDisponibles() {
        let original = ingresos.find((i) => i.id_ingreso == formulario.id_ingreso);
        return cargos.filter((c) => c.id_departamento == formulario.id_departamento
            && (c.estado !== 'pagado' || (original && original.id_cargo == c.id_cargo)));
    }

    async function guardar() {
        let resultado = await enviar('/api/ingreso/guardarIngreso', formulario);
        if (resultado.Success) {
            setFormulario(null);
            setMensaje({ tipo: 'success', texto: 'El ingreso se guardó correctamente' });
            cargar();
        } else {
            setError(resultado.Mensaje);
        }
    }

    async function eliminar() {
        let resultado = await enviar('/api/ingreso/eliminarIngreso', { id_ingreso: aEliminar.id_ingreso });
        setAEliminar(null);
        if (resultado.Success) {
            setMensaje({ tipo: 'success', texto: 'El ingreso se eliminó correctamente' });
            cargar();
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    // Solo cuentan los ingresos registrados (los anulados no)
    let registrados = ingresos.filter((i) => i.estado === 'registrado');
    let mesActual = hoy().slice(0, 7);
    let filtrados = ingresos.filter((i) => (filtroEstado === '' || i.estado === filtroEstado)
        && (filtroMetodo === '' || i.metodo_pago === filtroMetodo)
        && coincide(busqueda, i.concepto, i.departamento, i.tipo_ingreso));
    let totalFiltrado = sumar(filtrados.filter((i) => i.estado === 'registrado'));

    return (
        <>
            <Encabezado titulo="Ingresos"
                descripcion="Pagos de cada departamento. Si el pago cancela un cargo, el cargo queda como pagado."
                textoBoton="Registrar ingreso" onAdicionar={adicionar} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <Resumen items={[
                { etiqueta: 'Total recaudado', valor: dinero(sumar(registrados)) },
                { etiqueta: 'Recaudado este mes', valor: dinero(sumar(registrados.filter((i) => i.fecha.startsWith(mesActual)))) },
                { etiqueta: 'Pagos registrados', valor: registrados.length },
                { etiqueta: 'Pagos anulados', valor: ingresos.length - registrados.length }
            ]} />

            <section className="panel panel-tabla">
                <div className="tabla-herramientas">
                    <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por concepto, departamento o tipo" />
                    <select className="form-select" aria-label="Filtrar por estado" value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="registrado">Registrados</option>
                        <option value="anulado">Anulados</option>
                    </select>
                    <select className="form-select" aria-label="Filtrar por método de pago" value={filtroMetodo}
                        onChange={(e) => setFiltroMetodo(e.target.value)}>
                        <option value="">Todos los métodos</option>
                        {metodosPago.map((metodo) => (
                            <option key={metodo} value={metodo}>{capitalizar(metodo)}</option>
                        ))}
                    </select>
                    <span className="tabla-conteo">{filtrados.length} de {ingresos.length} registros</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Departamento</th>
                                <th>Concepto</th>
                                <th>Método</th>
                                <th className="text-end">Monto</th>
                                <th>Estado</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 && <SinDatos columnas={7} cargando={cargando} filtrado={ingresos.length > 0} />}
                            {filtrados.map((ingreso) => (
                                <tr key={ingreso.id_ingreso} className={ingreso.estado === 'anulado' ? 'anulado' : ''}>
                                    <td className="text-nowrap">{formatoFecha(ingreso.fecha)}</td>
                                    <td><span className="etiqueta">{ingreso.departamento}</span></td>
                                    <td>
                                        {ingreso.concepto}
                                        <span className="secundario">{ingreso.tipo_ingreso}</span>
                                    </td>
                                    <td>{capitalizar(ingreso.metodo_pago)}</td>
                                    <td className="text-end numero fw-semibold monto">{dinero(ingreso.monto)}</td>
                                    <td><Estado valor={ingreso.estado} /></td>
                                    <Acciones onEditar={() => abrirFormulario(ingreso)} onEliminar={() => setAEliminar(ingreso)} />
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
                    </table>
                </div>
            </section>

            {formulario && (
                <Modal titulo={formulario.id_ingreso == 0 ? 'Registrar ingreso' : 'Editar ingreso'}
                    descripcion="Si elige un cargo, se copian su concepto y su monto, y el cargo queda pagado."
                    error={error} onCerrar={() => setFormulario(null)} onAceptar={guardar}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label requerido">Departamento</label>
                            <select name="id_departamento" className="form-select" value={formulario.id_departamento} onChange={cambiar}>
                                {departamentos.map((departamento) => (
                                    <option key={departamento.id_departamento} value={departamento.id_departamento}>{departamento.numero}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Tipo de ingreso</label>
                            <select name="id_tipo_ingreso" className="form-select" value={formulario.id_tipo_ingreso} onChange={cambiar}>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id_tipo_ingreso} value={tipo.id_tipo_ingreso}>{tipo.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Cargo que paga</label>
                            <select name="id_cargo" className="form-select" value={formulario.id_cargo} onChange={cambiar}>
                                <option value="">Ninguno (ingreso extraordinario)</option>
                                {cargosDisponibles().map((cargo) => (
                                    <option key={cargo.id_cargo} value={cargo.id_cargo}>
                                        {cargo.concepto} {mesLargo(cargo.periodo)} — {dinero(cargo.monto)} ({cargo.estado})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label requerido">Concepto</label>
                            <input name="concepto" className="form-control" maxLength="180" placeholder="Ej. Expensas noviembre"
                                value={formulario.concepto} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Monto (Bs)</label>
                            <input name="monto" type="number" step="0.01" min="0" className="form-control" placeholder="0.00"
                                value={formulario.monto} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Fecha</label>
                            <input name="fecha" type="date" className="form-control" value={formulario.fecha} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Método de pago</label>
                            <select name="metodo_pago" className="form-select" value={formulario.metodo_pago} onChange={cambiar}>
                                {metodosPago.map((metodo) => (
                                    <option key={metodo} value={metodo}>{capitalizar(metodo)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Estado</label>
                            <select name="estado" className="form-select" value={formulario.estado} onChange={cambiar}>
                                <option value="registrado">Registrado</option>
                                <option value="anulado">Anulado</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar ingreso" textoAceptar="Sí, eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar el ingreso <b>{aEliminar.concepto}</b> del departamento <b>{aEliminar.departamento}</b>?
                    {aEliminar.id_cargo && <div className="text-body-secondary small mt-2">El cargo que pagaba volverá a quedar pendiente.</div>}
                </Modal>
            )}
        </>
    );
}
