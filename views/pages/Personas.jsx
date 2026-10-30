import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import SinDatos from '../components/SinDatos';

const personaNueva = { id_persona: 0, nombre: '', telefono: '', correo: '' };

export default function Personas() {
    const [personas, setPersonas] = useState([]);
    const [formulario, setFormulario] = useState(null);   // persona que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // persona que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/persona/obtenerPersonas');
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

    return (
        <>
            <Encabezado titulo="Personas" descripcion="Propietarios, inquilinos y familiares del condominio."
                onAdicionar={() => abrirFormulario(personaNueva)} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Código</th>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personas.length === 0 && <SinDatos columnas={5} />}
                            {personas.map((persona) => (
                                <tr key={persona.id_persona}>
                                    <td className="text-center">{persona.id_persona}</td>
                                    <td>{persona.nombre}</td>
                                    <td>{persona.telefono}</td>
                                    <td>{persona.correo}</td>
                                    <Acciones onEditar={() => abrirFormulario(persona)} onEliminar={() => setAEliminar(persona)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {formulario && (
                <Modal titulo={formulario.id_persona == 0 ? 'Adicionar persona' : 'Editar persona'}
                    error={error} onCerrar={() => setFormulario(null)} onAceptar={guardar}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Nombre *</label>
                            <input name="nombre" className="form-control" maxLength="120" value={formulario.nombre} onChange={cambiar} />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label">Teléfono</label>
                            <input name="telefono" className="form-control" maxLength="25" value={formulario.telefono} onChange={cambiar} />
                        </div>
                        <div className="col-md-7">
                            <label className="form-label">Correo</label>
                            <input name="correo" type="email" className="form-control" maxLength="120" value={formulario.correo} onChange={cambiar} />
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar persona" textoAceptar="Eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar a <b>{aEliminar.nombre}</b>?
                </Modal>
            )}
        </>
    );
}
