import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import { coincide, iniciales, capitalizar, formatoFecha } from '../formato';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import Estado from '../components/Estado';
import SinDatos from '../components/SinDatos';
import Resumen from '../components/Resumen';
import Buscador from '../components/Buscador';

export default function Residentes() {
    const [residentes, setResidentes] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRelacion, setFiltroRelacion] = useState('');
    const [formulario, setFormulario] = useState(null);   // residente que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // residente que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/residente/obtenerResidentes');
        setCargando(false);
        if (resultado.Success) {
            setResidentes(resultado.Data.Residentes);
            setDepartamentos(resultado.Data.Departamentos);
            setPersonas(resultado.Data.Personas);
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    useEffect(() => { cargar(); }, []);

    function abrirFormulario(residente) {
        setError('');
        setFormulario(sinNulos(residente));
    }

    function adicionar() {
        // Para registrar un residente primero deben existir departamentos y personas
        if (departamentos.length === 0 || personas.length === 0) {
            setMensaje({ tipo: 'warning', texto: 'Primero debe registrar al menos un departamento y una persona' });
            return;
        }
        abrirFormulario({
            id_residente: 0, id_departamento: departamentos[0].id_departamento, id_persona: personas[0].id_persona,
            tipo_relacion: 'propietario', fecha_inicio: '', fecha_fin: '', estado: 'activo'
        });
    }

    function cambiar(e) {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }

    async function guardar() {
        let resultado = await enviar('/api/residente/guardarResidente', formulario);
        if (resultado.Success) {
            setFormulario(null);
            setMensaje({ tipo: 'success', texto: 'El residente se guardó correctamente' });
            cargar();
        } else {
            setError(resultado.Mensaje);
        }
    }

    async function eliminar() {
        let resultado = await enviar('/api/residente/eliminarResidente', { id_residente: aEliminar.id_residente });
        setAEliminar(null);
        if (resultado.Success) {
            setMensaje({ tipo: 'success', texto: 'El residente se eliminó correctamente' });
            cargar();
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    let activos = residentes.filter((r) => r.estado === 'activo');
    let filtrados = residentes.filter((r) => (filtroRelacion === '' || r.tipo_relacion === filtroRelacion)
        && coincide(busqueda, r.persona, r.departamento, r.tipo_relacion));

    return (
        <>
            <Encabezado titulo="Residentes"
                descripcion="Personas asignadas a cada departamento. Requiere departamentos y personas registrados."
                textoBoton="Asignar residente" onAdicionar={adicionar} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <Resumen items={[
                { etiqueta: 'Residentes activos', valor: activos.length },
                { etiqueta: 'Propietarios', valor: activos.filter((r) => r.tipo_relacion === 'propietario').length },
                { etiqueta: 'Inquilinos', valor: activos.filter((r) => r.tipo_relacion === 'inquilino').length },
                { etiqueta: 'Departamentos ocupados', valor: new Set(activos.map((r) => r.id_departamento)).size }
            ]} />

            <section className="panel panel-tabla">
                <div className="tabla-herramientas">
                    <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por persona o departamento" />
                    <select className="form-select" aria-label="Filtrar por relación" value={filtroRelacion}
                        onChange={(e) => setFiltroRelacion(e.target.value)}>
                        <option value="">Todas las relaciones</option>
                        <option value="propietario">Propietarios</option>
                        <option value="inquilino">Inquilinos</option>
                        <option value="familiar">Familiares</option>
                    </select>
                    <span className="tabla-conteo">{filtrados.length} de {residentes.length} registros</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover tabla">
                        <thead>
                            <tr>
                                <th>Residente</th>
                                <th>Departamento</th>
                                <th>Relación</th>
                                <th>Vigencia</th>
                                <th>Estado</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 && <SinDatos columnas={6} cargando={cargando} filtrado={residentes.length > 0} />}
                            {filtrados.map((residente) => (
                                <tr key={residente.id_residente}>
                                    <td>
                                        <div className="celda-persona">
                                            <span className="avatar">{iniciales(residente.persona)}</span>
                                            <strong>{residente.persona}</strong>
                                        </div>
                                    </td>
                                    <td><span className="etiqueta">{residente.departamento}</span></td>
                                    <td>{capitalizar(residente.tipo_relacion)}</td>
                                    <td className="text-nowrap">
                                        Desde {formatoFecha(residente.fecha_inicio)}
                                        <span className="secundario">
                                            {residente.fecha_fin ? 'Hasta ' + formatoFecha(residente.fecha_fin) : 'Sin fecha de salida'}
                                        </span>
                                    </td>
                                    <td><Estado valor={residente.estado} /></td>
                                    <Acciones onEditar={() => abrirFormulario(residente)} onEliminar={() => setAEliminar(residente)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {formulario && (
                <Modal titulo={formulario.id_residente == 0 ? 'Asignar residente' : 'Editar residente'}
                    descripcion="Relacione una persona con un departamento del condominio."
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
                            <label className="form-label requerido">Persona</label>
                            <select name="id_persona" className="form-select" value={formulario.id_persona} onChange={cambiar}>
                                {personas.map((persona) => (
                                    <option key={persona.id_persona} value={persona.id_persona}>{persona.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Relación</label>
                            <select name="tipo_relacion" className="form-select" value={formulario.tipo_relacion} onChange={cambiar}>
                                <option value="propietario">Propietario</option>
                                <option value="inquilino">Inquilino</option>
                                <option value="familiar">Familiar</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Estado</label>
                            <select name="estado" className="form-select" value={formulario.estado} onChange={cambiar}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label requerido">Fecha de inicio</label>
                            <input name="fecha_inicio" type="date" className="form-control" value={formulario.fecha_inicio} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Fecha de salida</label>
                            <input name="fecha_fin" type="date" className="form-control" value={formulario.fecha_fin} onChange={cambiar} />
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar residente" textoAceptar="Sí, eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea quitar a <b>{aEliminar.persona}</b> del departamento <b>{aEliminar.departamento}</b>?
                </Modal>
            )}
        </>
    );
}
