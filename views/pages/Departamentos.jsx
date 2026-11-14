import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import { coincide, dinero, decimal, sumar } from '../formato';
import { ESTADOS_REGISTRO, OCUPACION } from '../opciones';
import { ocupacion, enlaceFicha } from '../logica/departamentos';
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
import Nota from '../components/Nota';
import Modal from '../components/Modal';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import Campo from '../components/Campo';
import Opciones from '../components/Opciones';

export default function Departamentos() {
    const crud = useCrud({
        rutas: {
            obtener: '/api/departamento/obtenerDepartamentos',
            guardar: '/api/departamento/guardarDepartamento',
            eliminar: '/api/departamento/eliminarDepartamento'
        },
        id: 'id_departamento', nombre: 'El departamento', inicial: { Departamentos: [], Tipos: [] }
    });
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroOcupacion, setFiltroOcupacion] = useState('');

    const { Departamentos: departamentos, Tipos: tipos } = crud.datos;
    const formulario = crud.formulario;

    // Cada condominio define sus tipos (con la cuota): sin al menos uno no se puede crear un departamento
    const sinTipos = !crud.cargando && tipos.length === 0;

    function adicionar() {
        if (sinTipos) {
            crud.avisar('warning', 'Primero cree los tipos de departamento de este condominio en Configuración');
            return;
        }
        crud.abrirFormulario({
            id_departamento: 0, numero: '', piso: '', metros_cuadrados: '', estado: 'activo',
            id_tipo_departamento: tipos[0].id_tipo_departamento
        });
    }

    const activos = departamentos.filter((d) => d.estado === 'activo');
    const disponibles = activos.filter((d) => ocupacion(d) === 'disponible');
    const conDeuda = departamentos.filter((d) => Number(d.deuda) > 0);
    const filtrados = departamentos.filter((d) => (filtroEstado === '' || d.estado === filtroEstado)
        && (filtroOcupacion === '' || ocupacion(d) === filtroOcupacion)
        && coincide(busqueda, d.numero, d.tipo_departamento, d.propietario, d.piso));

    return (
        <>
            <Encabezado titulo="Departamentos" descripcion="Unidades del condominio con su ocupación, propietario y estado de cuenta."
                textoBoton="Nuevo departamento" onAdicionar={adicionar} />
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            {sinTipos && (
                <div className="mb-3">
                    <Nota tono="aviso" titulo="Este condominio todavía no tiene tipos de departamento">
                        Cada tipo define la cuota mensual de sus departamentos. Créelos en{' '}
                        <a href="/configuracion#tipoDepartamento">Configuración</a> y después registre los departamentos.
                    </Nota>
                </div>
            )}

            {!crud.cargando && activos.length > 0 && disponibles.length === 0 && (
                <div className="mb-3">
                    <Nota tono="info" titulo="No hay departamentos disponibles">
                        Los {activos.length} departamentos activos están ocupados.
                    </Nota>
                </div>
            )}

            <Resumen items={[
                { etiqueta: 'Departamentos activos', valor: activos.length, detalle: decimal(sumar(activos, 'metros_cuadrados')) + ' m² en total' },
                {
                    etiqueta: 'Disponibles', valor: disponibles.length,
                    detalle: disponibles.length === 0 ? 'Todos ocupados' : (activos.length - disponibles.length) + ' ocupados',
                    tono: disponibles.length > 0 ? 'bueno' : undefined
                },
                { etiqueta: 'Expensas mensuales', valor: dinero(sumar(activos, 'cuota_mensual')) },
                {
                    etiqueta: 'Deuda total', valor: dinero(sumar(departamentos, 'deuda')),
                    detalle: conDeuda.length + (conDeuda.length === 1 ? ' departamento con deuda' : ' departamentos con deuda'),
                    tono: conDeuda.length > 0 ? 'critico' : undefined
                }
            ]} />

            <PanelTabla mostrados={filtrados.length} total={departamentos.length} herramientas={<>
                <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por número, tipo o propietario" />
                <Filtro etiqueta="Filtrar por ocupación" todos="Toda ocupación" opciones={OCUPACION}
                    valor={filtroOcupacion} onCambiar={setFiltroOcupacion} />
                <Filtro etiqueta="Filtrar por estado" todos="Todos los estados" opciones={ESTADOS_REGISTRO}
                    valor={filtroEstado} onCambiar={setFiltroEstado} />
            </>}>
                <thead>
                    <tr>
                        <th>Departamento</th>
                        <th>Tipo</th>
                        <th>Propietario</th>
                        <th>Ocupación</th>
                        <th className="text-end">Deuda</th>
                        <th>Estado</th>
                        <th className="text-end columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={7} cargando={crud.cargando} filtrado={departamentos.length > 0} />}
                    {filtrados.map((departamento) => (
                        <tr key={departamento.id_departamento}>
                            <td>
                                <a className="etiqueta enlace-etiqueta me-2" href={enlaceFicha(departamento.id_departamento)}>{departamento.numero}</a>
                                <span className="text-body-secondary small">Piso {departamento.piso} · {decimal(departamento.metros_cuadrados)} m²</span>
                            </td>
                            <td>
                                {departamento.tipo_departamento}
                                <span className="secundario">Cuota {dinero(departamento.cuota_mensual)}</span>
                            </td>
                            <td>{departamento.propietario || <span className="text-body-tertiary">Sin propietario</span>}</td>
                            <td>
                                {ocupacion(departamento) ? <Estado valor={ocupacion(departamento)} /> : <span className="text-body-tertiary">—</span>}
                                {departamento.residentes_activos > 0 && (
                                    <span className="secundario">
                                        {departamento.residentes_activos} {departamento.residentes_activos === 1 ? 'residente' : 'residentes'}
                                    </span>
                                )}
                            </td>
                            <td className={'text-end numero fw-semibold' + (Number(departamento.deuda) > 0 ? ' texto-deuda' : '')}>
                                {dinero(departamento.deuda)}
                                {Number(departamento.saldo_favor) > 0 && <span className="secundario sube">{dinero(departamento.saldo_favor)} a favor</span>}
                            </td>
                            <td><Estado valor={departamento.estado} /></td>
                            {/* Con historial no se elimina: se marca como inactivo al editarlo */}
                            <Acciones onEditar={() => crud.abrirFormulario(departamento)}
                                onEliminar={departamento.con_historial ? undefined : () => crud.confirmarEliminar(departamento)}>
                                <BotonIcono icono="ficha" titulo="Ver ficha" href={enlaceFicha(departamento.id_departamento)} />
                            </Acciones>
                        </tr>
                    ))}
                </tbody>
            </PanelTabla>

            {formulario && (
                <Modal titulo={formulario.id_departamento == 0 ? 'Nuevo departamento' : 'Editar departamento'}
                    descripcion="La cuota mensual se toma del tipo de departamento."
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Número" requerido ancho="col-md-6">
                            <input name="numero" className="form-control" maxLength="15" placeholder="Ej. A-101"
                                autoFocus value={formulario.numero} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Piso" requerido ancho="col-md-6" ayuda="0 = planta baja">
                            <input name="piso" type="number" className="form-control" placeholder="Ej. 1"
                                value={formulario.piso} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Tipo de departamento" requerido
                            ayuda={<>Los tipos y sus cuotas se administran en <a href="/configuracion#tipoDepartamento">Configuración</a>.</>}>
                            <select name="id_tipo_departamento" className="form-select" value={formulario.id_tipo_departamento} onChange={crud.cambiar}>
                                <Opciones lista={tipos} valor="id_tipo_departamento"
                                    texto={(tipo) => tipo.nombre + ' — cuota ' + dinero(tipo.cuota_mensual)} />
                            </select>
                        </Campo>
                        <Campo etiqueta="Superficie (m²)" requerido ancho="col-md-6">
                            <input name="metros_cuadrados" type="number" step="0.01" min="0" className="form-control" placeholder="Ej. 80.50"
                                value={formulario.metros_cuadrados} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Estado" requerido ancho="col-md-6">
                            <select name="estado" className="form-select" value={formulario.estado} onChange={crud.cambiar}>
                                <Opciones lista={ESTADOS_REGISTRO} />
                            </select>
                        </Campo>
                    </div>
                </Modal>
            )}

            {crud.aEliminar && (
                <ConfirmarEliminar titulo="Eliminar departamento" onCerrar={crud.cancelarEliminar} onAceptar={crud.eliminar}>
                    ¿Está seguro que desea eliminar el departamento <b>{crud.aEliminar.numero}</b>? Solo se puede eliminar
                    si no tiene residentes, cargos ni pagos registrados.
                </ConfirmarEliminar>
            )}
        </>
    );
}
