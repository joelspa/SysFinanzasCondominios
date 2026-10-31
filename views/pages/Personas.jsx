import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import { coincide, iniciales } from '../formato';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import SinDatos from '../components/SinDatos';
import Resumen from '../components/Resumen';
import Buscador from '../components/Buscador';
import Icono from '../components/Icono';

const personaNueva = { id_persona: 0, nombre: '', telefono: '', correo: '' };

export default function Personas() {
    const [personas, setPersonas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [formulario, setFormulario] = useState(null);   // persona que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // persona que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/persona/obtenerPersonas');
        setCargando(false);
        if (resultado.Success) {
            setPersonas(resultado.Data);
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    useEffect(() => { cargar(); }, []);

    function abrirFormulario(persona) {
        setError('');
        setFormulario(sinNulos(persona));
    }

    function cambiar(e) {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }

    async function guardar() {
        let resultado = await enviar('/api/persona/guardarPersona', formulario);
        if (resultado.Success) {
            setFormulario(null);
            setMensaje({ tipo: 'success', texto: 'La persona se guardó correctamente' });
            cargar();
        } else {
            setError(resultado.Mensaje);
        }
    }

    async function eliminar() {
        let resultado = await enviar('/api/persona/eliminarPersona', { id_persona: aEliminar.id_persona });
        setAEliminar(null);
        if (resultado.Success) {
            setMensaje({ tipo: 'success', texto: 'La persona se eliminó correctamente' });
            cargar();
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    let filtradas = personas.filter((p) => coincide(busqueda, p.nombre, p.telefono, p.correo, p.id_persona));

    return (
        <>
            <Encabezado titulo="Personas" descripcion="Propietarios, inquilinos y familiares registrados en el condominio."
                textoBoton="Nueva persona" onAdicionar={() => abrirFormulario(personaNueva)} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <Resumen items={[
                { etiqueta: 'Personas registradas', valor: personas.length },
                { etiqueta: 'Con teléfono', valor: personas.filter((p) => p.telefono).length },
                { etiqueta: 'Con correo electrónico', valor: personas.filter((p) => p.correo).length }
            ]} />

            <section className="panel panel-tabla">
                <div className="tabla-herramientas">
                    <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por nombre, teléfono o correo" />
                    <span className="tabla-conteo">{filtradas.length} de {personas.length} registros</span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover tabla">
                        <thead>
                            <tr>
                                <th>Persona</th>
                                <th>Teléfono</th>
                                <th>Correo electrónico</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.length === 0 && <SinDatos columnas={4} cargando={cargando} filtrado={personas.length > 0} />}
                            {filtradas.map((persona) => (
                                <tr key={persona.id_persona}>
                                    <td>
                                        <div className="celda-persona">
                                            <span className="avatar">{iniciales(persona.nombre)}</span>
                                            <div>
                                                <strong>{persona.nombre}</strong>
                                                <span className="secundario">Código #{persona.id_persona}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {persona.telefono
                                            ? <span className="con-icono"><Icono nombre="telefono" tamano={15} />{persona.telefono}</span>
                                            : <span className="text-body-tertiary">—</span>}
                                    </td>
                                    <td>
                                        {persona.correo
                                            ? <a className="con-icono enlace" href={'mailto:' + persona.correo}><Icono nombre="correo" tamano={15} />{persona.correo}</a>
                                            : <span className="text-body-tertiary">—</span>}
                                    </td>
                                    <Acciones onEditar={() => abrirFormulario(persona)} onEliminar={() => setAEliminar(persona)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {formulario && (
                <Modal titulo={formulario.id_persona == 0 ? 'Nueva persona' : 'Editar persona'}
                    descripcion="Datos de contacto del propietario, inquilino o familiar."
                    error={error} onCerrar={() => setFormulario(null)} onAceptar={guardar}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label requerido">Nombre completo</label>
                            <input name="nombre" className="form-control" maxLength="120" placeholder="Ej. Ana Pérez"
                                autoFocus value={formulario.nombre} onChange={cambiar} />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label">Teléfono</label>
                            <input name="telefono" className="form-control" maxLength="25" placeholder="Ej. 70000000"
                                value={formulario.telefono} onChange={cambiar} />
                        </div>
                        <div className="col-md-7">
                            <label className="form-label">Correo electrónico</label>
                            <input name="correo" type="email" className="form-control" maxLength="120" placeholder="nombre@correo.com"
                                value={formulario.correo} onChange={cambiar} />
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar persona" textoAceptar="Sí, eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar a <b>{aEliminar.nombre}</b>? Esta acción no se puede deshacer.
                </Modal>
            )}
        </>
    );
}
