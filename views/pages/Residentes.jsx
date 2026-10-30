import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import Estado from '../components/Estado';
import SinDatos from '../components/SinDatos';

export default function Residentes() {
    const [residentes, setResidentes] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [formulario, setFormulario] = useState(null);   // residente que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // residente que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/residente/obtenerResidentes');
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

    return (
        <>
            <Encabezado titulo="Residentes"
                descripcion="Personas asignadas a cada departamento. Requiere departamentos y personas registrados."
                onAdicionar={adicionar} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Código</th>
                                <th className="text-center">Departamento</th>
                                <th>Persona</th>
                                <th>Relación</th>
                                <th className="text-center">Fecha inicio</th>
                                <th className="text-center">Fecha fin</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {residentes.length === 0 && <SinDatos columnas={8} />}
                            {residentes.map((residente) => (
                                <tr key={residente.id_residente}>
                                    <td className="text-center">{residente.id_residente}</td>
                                    <td className="text-center">{residente.departamento}</td>
                                    <td>{residente.persona}</td>
                                    <td>{residente.tipo_relacion}</td>
                                    <td className="text-center">{residente.fecha_inicio}</td>
                                    <td className="text-center">{residente.fecha_fin}</td>
                                    <td className="text-center"><Estado valor={residente.estado} /></td>
                                    <Acciones onEditar={() => abrirFormulario(residente)} onEliminar={() => setAEliminar(residente)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {formulario && (
                <Modal titulo={formulario.id_residente == 0 ? 'Adicionar residente' : 'Editar residente'}
                    error={error} onCerrar={() => setFormulario(null)} onAceptar={guardar}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Departamento *</label>
                            <select name="id_departamento" className="form-select" value={formulario.id_departamento} onChange={cambiar}>
                                {departamentos.map((departamento) => (
                                    <option key={departamento.id_departamento} value={departamento.id_departamento}>{departamento.numero}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Persona *</label>
                            <select name="id_persona" className="form-select" value={formulario.id_persona} onChange={cambiar}>
                                {personas.map((persona) => (
                                    <option key={persona.id_persona} value={persona.id_persona}>{persona.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Relación *</label>
                            <select name="tipo_relacion" className="form-select" value={formulario.tipo_relacion} onChange={cambiar}>
                                <option value="propietario">Propietario</option>
                                <option value="inquilino">Inquilino</option>
                                <option value="familiar">Familiar</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Estado *</label>
                            <select name="estado" className="form-select" value={formulario.estado} onChange={cambiar}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Fecha inicio *</label>
                            <input name="fecha_inicio" type="date" className="form-control" value={formulario.fecha_inicio} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Fecha fin</label>
                            <input name="fecha_fin" type="date" className="form-control" value={formulario.fecha_fin} onChange={cambiar} />
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar residente" textoAceptar="Eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar a <b>{aEliminar.persona}</b> del departamento <b>{aEliminar.departamento}</b>?
                </Modal>
            )}
        </>
    );
}
