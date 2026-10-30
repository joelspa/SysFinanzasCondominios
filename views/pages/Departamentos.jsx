import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import Estado from '../components/Estado';
import SinDatos from '../components/SinDatos';

export default function Departamentos() {
    const [departamentos, setDepartamentos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [formulario, setFormulario] = useState(null);   // departamento que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // departamento que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/departamento/obtenerDepartamentos');
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

    return (
        <>
            <Encabezado titulo="Departamentos" descripcion="Departamentos del condominio y su tipo." onAdicionar={adicionar} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Código</th>
                                <th>Número</th>
                                <th className="text-center">Piso</th>
                                <th>Tipo</th>
                                <th className="text-end">Metros cuadrados</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departamentos.length === 0 && <SinDatos columnas={7} />}
                            {departamentos.map((departamento) => (
                                <tr key={departamento.id_departamento}>
                                    <td className="text-center">{departamento.id_departamento}</td>
                                    <td>{departamento.numero}</td>
                                    <td className="text-center">{departamento.piso}</td>
                                    <td>{departamento.tipo_departamento}</td>
                                    <td className="text-end">{departamento.metros_cuadrados} m²</td>
                                    <td className="text-center"><Estado valor={departamento.estado} /></td>
                                    <Acciones onEditar={() => abrirFormulario(departamento)} onEliminar={() => setAEliminar(departamento)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {formulario && (
                <Modal titulo={formulario.id_departamento == 0 ? 'Adicionar departamento' : 'Editar departamento'}
                    error={error} onCerrar={() => setFormulario(null)} onAceptar={guardar}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Número *</label>
                            <input name="numero" className="form-control" maxLength="15" placeholder="Ej. A-101"
                                value={formulario.numero} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Piso *</label>
                            <input name="piso" type="number" className="form-control" value={formulario.piso} onChange={cambiar} />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Tipo de departamento *</label>
                            <select name="id_tipo_departamento" className="form-select" value={formulario.id_tipo_departamento} onChange={cambiar}>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id_tipo_departamento} value={tipo.id_tipo_departamento}>
                                        {tipo.nombre} (cuota {tipo.cuota_mensual})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Metros cuadrados *</label>
                            <input name="metros_cuadrados" type="number" step="0.01" min="0" className="form-control"
                                value={formulario.metros_cuadrados} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Estado *</label>
                            <select name="estado" className="form-select" value={formulario.estado} onChange={cambiar}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar departamento" textoAceptar="Eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar el departamento <b>{aEliminar.numero}</b>?
                </Modal>
            )}
        </>
    );
}
