import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import useDatos from '../hooks/useDatos';
import { coincide, iniciales, capitalizar, formatoFecha, dinero, hoy } from '../formato';
import { puedeTenerSalida, textoSalida, otrosPropietarios } from '../logica/residentes';
import { ESTADOS_REGISTRO, RELACIONES } from '../opciones';
import { enlaceFicha } from '../logica/departamentos';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Resumen from '../components/Resumen';
import Pestanas from '../components/Pestanas';
import PanelTabla from '../components/PanelTabla';
import Buscador from '../components/Buscador';
import Filtro from '../components/Filtro';
import SinDatos from '../components/SinDatos';
import Estado from '../components/Estado';
import Acciones from '../components/Acciones';
import Modal from '../components/Modal';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import Campo from '../components/Campo';
import Opciones from '../components/Opciones';
import Icono from '../components/Icono';
import Nota from '../components/Nota';
import Casilla from '../components/Casilla';
import ModalTraspaso from '../secciones/ModalTraspaso';

export default function Residentes() {
    const crud = useCrud({
        rutas: {
            obtener: '/api/residente/obtenerResidentes',
            guardar: '/api/residente/guardarResidente',
            eliminar: '/api/residente/eliminarResidente'
        },
        id: 'id_residente', nombre: 'El residente', inicial: { Residentes: [], Departamentos: [], Personas: [] }
    });
    const historial = useDatos('/api/traspaso/obtenerTraspasos', { Traspasos: [], Departamentos: [], Personas: [] });
    const [pestana, setPestana] = useState('residentes');
    const [busqueda, setBusqueda] = useState('');
    const [filtroRelacion, setFiltroRelacion] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activo');
    const [traspasando, setTraspasando] = useState(false);

    const { Residentes: residentes, Departamentos: departamentos, Personas: personas } = crud.datos;
    const traspasos = historial.datos.Traspasos;
    const formulario = crud.formulario;
    const coPropietarios = formulario ? otrosPropietarios(residentes, formulario) : [];

    function adicionar() {
        // Para registrar un residente primero deben existir departamentos y personas
        if (departamentos.length === 0 || personas.length === 0) {
            crud.avisar('warning', 'Primero debe registrar al menos un departamento y una persona');
            return;
        }
        crud.abrirFormulario({
            id_residente: 0, id_departamento: departamentos[0].id_departamento, id_persona: personas[0].id_persona,
            tipo_relacion: 'inquilino', fecha_inicio: hoy(), fecha_fin: '', estado: 'activo'
        });
    }

    // Si queda como propietario activo se borra la fecha de salida (no la lleva).
    // Si cambia el departamento, la persona, la relación o el estado, hay que volver a confirmar la copropiedad.
    function cambiar(e) {
        let cambios = { [e.target.name]: e.target.value };
        if (!puedeTenerSalida({ ...formulario, ...cambios })) {
            cambios.fecha_fin = '';
        }
        if (['id_departamento', 'id_persona', 'tipo_relacion', 'estado'].includes(e.target.name)) {
            cambios.confirmar_copropiedad = false;
        }
        crud.actualizarFormulario(cambios);
    }

    // Desde el aviso de propietario duplicado: cambia el formulario por un traspaso del mismo departamento
    function irATraspaso() {
        let idDepartamento = formulario.id_departamento;
        crud.cerrarFormulario();
        setTraspasando(idDepartamento);
    }

    async function traspasar(datos) {
        let error = await crud.ejecutar('/api/traspaso/realizarTraspaso', datos, 'El traspaso se registró correctamente');
        if (error) {
            return error;
        }
        setTraspasando(false);
        historial.recargar();
    }

    const activos = residentes.filter((r) => r.estado === 'activo');
    const filtrados = residentes.filter((r) => (filtroRelacion === '' || r.tipo_relacion === filtroRelacion)
        && (filtroEstado === '' || r.estado === filtroEstado)
        && coincide(busqueda, r.persona, r.departamento, r.tipo_relacion));
    const traspasosFiltrados = traspasos.filter((t) => coincide(busqueda, t.departamento, t.propietario_anterior, t.propietario_nuevo));

    return (
        <>
            <Encabezado titulo="Residentes"
                descripcion="Propietarios, inquilinos y familiares de cada departamento, con el historial de traspasos."
                textoBoton="Asignar residente" onAdicionar={adicionar}>
                <button className="btn btn-outline-primary" onClick={() => setTraspasando(true)} disabled={historial.cargando}>
                    <Icono nombre="traspaso" tamano={16} /> Traspaso de propiedad
                </button>
            </Encabezado>
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                { etiqueta: 'Residentes activos', valor: activos.length },
                { etiqueta: 'Propietarios', valor: activos.filter((r) => r.tipo_relacion === 'propietario').length },
                { etiqueta: 'Inquilinos', valor: activos.filter((r) => r.tipo_relacion === 'inquilino').length },
                { etiqueta: 'Traspasos registrados', valor: traspasos.length }
            ]} />

            <Pestanas activa={pestana} onCambiar={setPestana} pestanas={[
                { clave: 'residentes', texto: 'Residentes', contador: residentes.length },
                { clave: 'traspasos', texto: 'Historial de traspasos', contador: traspasos.length }
            ]} />

            {pestana === 'residentes' && (
                <PanelTabla mostrados={filtrados.length} total={residentes.length} herramientas={<>
                    <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por persona o departamento" />
                    <Filtro etiqueta="Filtrar por relación" todos="Todas las relaciones" opciones={RELACIONES}
                        valor={filtroRelacion} onCambiar={setFiltroRelacion} />
                    <Filtro etiqueta="Filtrar por estado" todos="Activos e inactivos" opciones={ESTADOS_REGISTRO}
                        valor={filtroEstado} onCambiar={setFiltroEstado} />
                </>}>
                    <thead>
                        <tr>
                            <th>Residente</th>
                            <th>Departamento</th>
                            <th>Relación</th>
                            <th>Vigencia</th>
                            <th>Estado</th>
                            <th className="text-end columna-acciones">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrados.length === 0 && <SinDatos columnas={6} cargando={crud.cargando} filtrado={residentes.length > 0} />}
                        {filtrados.map((residente) => (
                            <tr key={residente.id_residente}>
                                <td>
                                    <div className="celda-persona">
                                        <span className="avatar">{iniciales(residente.persona)}</span>
                                        <strong>{residente.persona}</strong>
                                    </div>
                                </td>
                                <td><a className="etiqueta enlace-etiqueta" href={enlaceFicha(residente.id_departamento)}>{residente.departamento}</a></td>
                                <td>{capitalizar(residente.tipo_relacion)}</td>
                                <td className="text-nowrap">
                                    Desde {formatoFecha(residente.fecha_inicio)}
                                    <span className="secundario">{textoSalida(residente)}</span>
                                </td>
                                <td><Estado valor={residente.estado} /></td>
                                <Acciones onEditar={() => crud.abrirFormulario(residente)} onEliminar={() => crud.confirmarEliminar(residente)} />
                            </tr>
                        ))}
                    </tbody>
                </PanelTabla>
            )}

            {pestana === 'traspasos' && (
                <PanelTabla mostrados={traspasosFiltrados.length} total={traspasos.length}
                    herramientas={<Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por departamento o propietario" />}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Departamento</th>
                            <th>Propietario anterior</th>
                            <th>Nuevo propietario</th>
                            <th className="text-end">Deuda transferida</th>
                            <th>Observación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {traspasosFiltrados.length === 0 && <SinDatos columnas={6} cargando={historial.cargando} filtrado={traspasos.length > 0} />}
                        {traspasosFiltrados.map((traspaso) => (
                            <tr key={traspaso.id_traspaso}>
                                <td className="text-nowrap">{formatoFecha(traspaso.fecha)}</td>
                                <td><a className="etiqueta enlace-etiqueta" href={enlaceFicha(traspaso.id_departamento)}>{traspaso.departamento}</a></td>
                                <td>{traspaso.propietario_anterior || <span className="text-body-tertiary">Sin propietario</span>}</td>
                                <td><strong>{traspaso.propietario_nuevo}</strong></td>
                                <td className={'text-end numero' + (Number(traspaso.deuda_pendiente) > 0 ? ' texto-deuda fw-semibold' : '')}>
                                    {dinero(traspaso.deuda_pendiente)}
                                </td>
                                <td>{traspaso.observacion || <span className="text-body-tertiary">—</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </PanelTabla>
            )}

            {formulario && (
                <Modal titulo={formulario.id_residente == 0 ? 'Asignar residente' : 'Editar residente'}
                    descripcion="Para cambiar al dueño de un departamento use «Traspaso de propiedad»: así queda el historial."
                    deshabilitado={coPropietarios.length > 0 && !formulario.confirmar_copropiedad}
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Departamento" requerido ancho="col-md-6">
                            <select name="id_departamento" className="form-select" value={formulario.id_departamento} onChange={cambiar}>
                                <Opciones lista={departamentos} valor="id_departamento" texto="numero" />
                            </select>
                        </Campo>
                        <Campo etiqueta="Persona" requerido ancho="col-md-6">
                            <select name="id_persona" className="form-select" value={formulario.id_persona} onChange={cambiar}>
                                <Opciones lista={personas} valor="id_persona" texto="nombre" />
                            </select>
                        </Campo>
                        <Campo etiqueta="Relación" requerido ancho="col-md-6">
                            <select name="tipo_relacion" className="form-select" value={formulario.tipo_relacion} onChange={cambiar}>
                                <Opciones lista={RELACIONES} />
                            </select>
                        </Campo>
                        <Campo etiqueta="Estado" requerido ancho="col-md-6">
                            <select name="estado" className="form-select" value={formulario.estado} onChange={cambiar}>
                                <Opciones lista={ESTADOS_REGISTRO} />
                            </select>
                        </Campo>
                        <Campo etiqueta={formulario.tipo_relacion === 'propietario' ? 'Propietario desde' : 'Fecha de ingreso'}
                            requerido ancho="col-md-6">
                            <input name="fecha_inicio" type="date" className="form-control" value={formulario.fecha_inicio} onChange={cambiar} />
                        </Campo>
                        {puedeTenerSalida(formulario) ? (
                            <Campo etiqueta="Fecha de salida" ancho="col-md-6" ayuda="Opcional. Déjela vacía si no hay una fecha definida.">
                                <input name="fecha_fin" type="date" className="form-control" value={formulario.fecha_fin} onChange={cambiar} />
                            </Campo>
                        ) : (
                            <div className="col-md-6">
                                <span className="form-label d-block">Fecha de salida</span>
                                <div className="campo-fijo">Sin fecha límite</div>
                            </div>
                        )}
                        {coPropietarios.length > 0 ? (
                            <div className="col-12">
                                <Nota tono="aviso" titulo={'Este departamento ya tiene como propietario a '
                                    + coPropietarios.map((r) => r.persona).join(' y ')}>
                                    Si vendió el departamento, registre un traspaso: así el propietario anterior queda en el
                                    historial con su fecha de salida y la deuda pendiente pasa al nuevo propietario.
                                    <div className="mt-2">
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={irATraspaso}>
                                            <Icono nombre="traspaso" tamano={14} /> Registrar traspaso en su lugar
                                        </button>
                                    </div>
                                </Nota>
                                <Casilla etiqueta="Son copropietarios del departamento"
                                    descripcion="Ambos son dueños al mismo tiempo (por ejemplo, una pareja que compró junta)."
                                    marcado={formulario.confirmar_copropiedad}
                                    onCambiar={(valor) => crud.actualizarFormulario({ confirmar_copropiedad: valor })} />
                            </div>
                        ) : !puedeTenerSalida(formulario) && (
                            <div className="col-12">
                                <Nota tono="info">
                                    Un propietario no tiene fecha de salida: deja de serlo solo cuando se registra
                                    un <b>Traspaso de propiedad</b>, que guarda la fecha y el historial.
                                </Nota>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {crud.aEliminar && (
                <ConfirmarEliminar titulo="Eliminar residente" onCerrar={crud.cancelarEliminar} onAceptar={crud.eliminar}>
                    ¿Está seguro que desea quitar a <b>{crud.aEliminar.persona}</b> del departamento <b>{crud.aEliminar.departamento}</b>?
                    Si la persona se fue, es mejor editarla y marcarla como inactiva con su fecha de salida.
                </ConfirmarEliminar>
            )}

            {traspasando && (
                <ModalTraspaso departamentos={historial.datos.Departamentos} personas={historial.datos.Personas}
                    idDepartamento={traspasando === true ? undefined : traspasando}
                    onCerrar={() => setTraspasando(false)} onConfirmar={traspasar} />
            )}
        </>
    );
}
