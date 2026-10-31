import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import { coincide, dinero, decimal } from '../formato';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import Estado from '../components/Estado';
import SinDatos from '../components/SinDatos';
import Resumen from '../components/Resumen';
import Buscador from '../components/Buscador';

export default function Departamentos() {
    const [departamentos, setDepartamentos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [formulario, setFormulario] = useState(null);   // departamento que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // departamento que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/departamento/obtenerDepartamentos');
        setCargando(false);
        if (resultado.Success) {
            setDepartamentos(resultado.Data.Departamentos);
            setTipos(resultado.Data.Tipos);
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    useEffect(() => { cargar(); }, []);

    function abrirFormulario(departamento) {
        setError('');
        setFormulario(sinNulos(departamento));
    }

    function adicionar() {
        abrirFormulario({
            id_departamento: 0, numero: '', piso: '', metros_cuadrados: '', estado: 'activo',
            id_tipo_departamento: tipos.length > 0 ? tipos[0].id_tipo_departamento : ''
        });
    }

    function cambiar(e) {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }

    async function guardar() {
        let resultado = await enviar('/api/departamento/guardarDepartamento', formulario);
        if (resultado.Success) {
            setFormulario(null);
            setMensaje({ tipo: 'success', texto: 'El departamento se guardó correctamente' });
            cargar();
        } else {
            setError(resultado.Mensaje);
        }
    }

    async function eliminar() {
        let resultado = await enviar('/api/departamento/eliminarDepartamento', { id_departamento: aEliminar.id_departamento });
        setAEliminar(null);
        if (resultado.Success) {
            setMensaje({ tipo: 'success', texto: 'El departamento se eliminó correctamente' });
            cargar();
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    // Cuota mensual según el tipo del departamento
    function cuota(departamento) {
        let tipo = tipos.find((t) => t.id_tipo_departamento == departamento.id_tipo_departamento);
        return tipo ? Number(tipo.cuota_mensual) : 0;
    }

    let activos = departamentos.filter((d) => d.estado === 'activo');
    let filtrados = departamentos.filter((d) => (filtroEstado === '' || d.estado === filtroEstado)
        && coincide(busqueda, d.numero, d.tipo_departamento, d.piso));

    return (
        <>
            <Encabezado titulo="Departamentos" descripcion="Unidades del condominio con su tipo, superficie y cuota mensual."
                textoBoton="Nuevo departamento" onAdicionar={adicionar} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <Resumen items={[
                { etiqueta: 'Departamentos', valor: departamentos.length },
                { etiqueta: 'Activos', valor: activos.length },
                { etiqueta: 'Superficie total', valor: decimal(departamentos.reduce((s, d) => s + Number(d.metros_cuadrados), 0)) + ' m²' },
                { etiqueta: 'Expensas mensuales', valor: dinero(activos.reduce((s, d) => s + cuota(d), 0)) }
            ]} />

            <section className="panel panel-tabla">
                <div className="tabla-herramientas">
                    <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por número, tipo o piso" />
                    <select className="form-select" aria-label="Filtrar por estado" value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                    <span className="tabla-conteo">{filtrados.length} de {departamentos.length} registros</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover tabla">
                        <thead>
                            <tr>
                                <th>Departamento</th>
                                <th>Tipo</th>
                                <th className="text-end">Superficie</th>
                                <th className="text-end">Cuota mensual</th>
                                <th>Estado</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 && <SinDatos columnas={6} cargando={cargando} filtrado={departamentos.length > 0} />}
                            {filtrados.map((departamento) => (
                                <tr key={departamento.id_departamento}>
                                    <td>
                                        <span className="etiqueta me-2">{departamento.numero}</span>
                                        <span className="text-body-secondary small">Piso {departamento.piso}</span>
                                    </td>
                                    <td>{departamento.tipo_departamento}</td>
                                    <td className="text-end numero">{decimal(departamento.metros_cuadrados)} m²</td>
                                    <td className="text-end numero">{dinero(cuota(departamento))}</td>
                                    <td><Estado valor={departamento.estado} /></td>
                                    <Acciones onEditar={() => abrirFormulario(departamento)} onEliminar={() => setAEliminar(departamento)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {formulario && (
                <Modal titulo={formulario.id_departamento == 0 ? 'Nuevo departamento' : 'Editar departamento'}
                    descripcion="La cuota mensual se toma del tipo de departamento."
                    error={error} onCerrar={() => setFormulario(null)} onAceptar={guardar}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label requerido">Número</label>
                            <input name="numero" className="form-control" maxLength="15" placeholder="Ej. A-101"
                                autoFocus value={formulario.numero} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Piso</label>
                            <input name="piso" type="number" className="form-control" placeholder="Ej. 1"
                                value={formulario.piso} onChange={cambiar} />
                        </div>
                        <div className="col-12">
                            <label className="form-label requerido">Tipo de departamento</label>
                            <select name="id_tipo_departamento" className="form-select" value={formulario.id_tipo_departamento} onChange={cambiar}>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id_tipo_departamento} value={tipo.id_tipo_departamento}>
                                        {tipo.nombre} — cuota {dinero(tipo.cuota_mensual)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Superficie (m²)</label>
                            <input name="metros_cuadrados" type="number" step="0.01" min="0" className="form-control" placeholder="Ej. 80.50"
                                value={formulario.metros_cuadrados} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Estado</label>
                            <select name="estado" className="form-select" value={formulario.estado} onChange={cambiar}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar departamento" textoAceptar="Sí, eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar el departamento <b>{aEliminar.numero}</b>? Esta acción no se puede deshacer.
                </Modal>
            )}
        </>
    );
}
