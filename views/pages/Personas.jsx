import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import { coincide, iniciales } from '../formato';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Resumen from '../components/Resumen';
import PanelTabla from '../components/PanelTabla';
import Buscador from '../components/Buscador';
import SinDatos from '../components/SinDatos';
import Acciones from '../components/Acciones';
import Modal from '../components/Modal';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import Campo from '../components/Campo';
import Icono from '../components/Icono';

const personaNueva = { id_persona: 0, nombre: '', documento: '', telefono: '', correo: '' };

// Misma regla que models/personaModel.js: con historial en el condominio no se puede eliminar
const tieneHistorial = (persona) => persona.residencias > 0 || persona.traspasos > 0 || persona.cargos > 0;

export default function Personas() {
    const crud = useCrud({
        rutas: {
            obtener: '/api/persona/obtenerPersonas',
            guardar: '/api/persona/guardarPersona',
            eliminar: '/api/persona/eliminarPersona'
        },
        id: 'id_persona', nombre: 'La persona', inicial: []
    });
    const [busqueda, setBusqueda] = useState('');

    const personas = crud.datos;
    const formulario = crud.formulario;
    const filtradas = personas.filter((p) => coincide(busqueda, p.nombre, p.documento, p.telefono, p.correo, p.id_persona));

    return (
        <>
            <Encabezado titulo="Personas" descripcion="Propietarios, inquilinos y familiares registrados en el condominio."
                textoBoton="Nueva persona" onAdicionar={() => crud.abrirFormulario(personaNueva)} />
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                { etiqueta: 'Personas registradas', valor: personas.length },
                { etiqueta: 'Con teléfono', valor: personas.filter((p) => p.telefono).length },
                { etiqueta: 'Con correo electrónico', valor: personas.filter((p) => p.correo).length }
            ]} />

            <PanelTabla mostrados={filtradas.length} total={personas.length}
                herramientas={<Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por nombre, CI, teléfono o correo" />}>
                <thead>
                    <tr>
                        <th>Persona</th>
                        <th>Teléfono</th>
                        <th>Correo electrónico</th>
                        <th>Vive en</th>
                        <th className="text-end columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtradas.length === 0 && <SinDatos columnas={5} cargando={crud.cargando} filtrado={personas.length > 0}
                        titulo="Todavía no hay personas registradas"
                        texto="Registre a los propietarios e inquilinos con su CI o NIT; después se asignan a su departamento en Residentes."
                        accion={{ texto: 'Registrar una persona', onClick: () => crud.abrirFormulario(personaNueva) }} />}
                    {filtradas.map((persona) => (
                        <tr key={persona.id_persona}>
                            <td>
                                <div className="celda-persona">
                                    <span className="avatar">{iniciales(persona.nombre)}</span>
                                    <div>
                                        <strong>{persona.nombre}</strong>
                                        <span className="secundario">{persona.documento ? 'CI/NIT ' + persona.documento : 'Sin CI/NIT registrado'}</span>
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
                            <td>
                                {persona.departamentos
                                    ? persona.departamentos.split(', ').map((numero) => <span key={numero} className="etiqueta me-1">{numero}</span>)
                                    : <span className="text-body-tertiary">—</span>}
                            </td>
                            {/* Con historial (residencias, traspasos o cargos) no se elimina: solo se edita */}
                            <Acciones onEditar={() => crud.abrirFormulario(persona)}
                                onEliminar={tieneHistorial(persona) ? undefined : () => crud.confirmarEliminar(persona)} />
                        </tr>
                    ))}
                </tbody>
            </PanelTabla>

            {formulario && (
                <Modal titulo={formulario.id_persona == 0 ? 'Nueva persona' : 'Editar persona'}
                    descripcion="Datos del propietario, inquilino o familiar."
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Nombre completo" requerido>
                            <input name="nombre" className="form-control" maxLength="120" placeholder="Ej. Ana Pérez"
                                autoFocus value={formulario.nombre} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="CI o NIT" ancho="col-md-6" ayuda="Sale en los recibos de pago.">
                            <input name="documento" className="form-control" maxLength="20" placeholder="Ej. 7654321 SC"
                                value={formulario.documento} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Teléfono" ancho="col-md-6">
                            <input name="telefono" className="form-control" maxLength="25" placeholder="Ej. 70000000"
                                value={formulario.telefono} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Correo electrónico">
                            <input name="correo" type="email" className="form-control" maxLength="120" placeholder="nombre@correo.com"
                                value={formulario.correo} onChange={crud.cambiar} />
                        </Campo>
                    </div>
                </Modal>
            )}

            {crud.aEliminar && (
                <ConfirmarEliminar titulo="Eliminar persona" onCerrar={crud.cancelarEliminar} onAceptar={crud.eliminar}>
                    ¿Está seguro que desea eliminar a <b>{crud.aEliminar.nombre}</b>? Esta acción no se puede deshacer.
                </ConfirmarEliminar>
            )}
        </>
    );
}
