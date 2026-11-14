import useCrud from '../hooks/useCrud';
import { enviar } from '../api';
import { dinero, dineroConSigno, sumar, cantidad } from '../formato';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Resumen from '../components/Resumen';
import SinDatos from '../components/SinDatos';
import Acciones from '../components/Acciones';
import Modal from '../components/Modal';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import Campo from '../components/Campo';
import Casilla from '../components/Casilla';

const condominioNuevo = { nombre: '', direccion: '', dia_vencimiento: 10, copiar_tipos: true };

// Dinero disponible del condominio: todo lo cobrado menos todo lo gastado
const disponible = (condominio) => Number(condominio.ingresos) - Number(condominio.egresos);

// Todos los condominios que puede ver el usuario, con su resumen financiero para compararlos.
// Desde aquí se elige en cuál trabajar y el administrador crea los nuevos.
//   usuario: quien tiene la sesión abierta (trae el condominio en el que está trabajando)
export default function Condominios({ usuario }) {
    const crud = useCrud({
        rutas: { obtener: '/api/condominio/obtenerCondominios' },
        id: 'id_condominio', nombre: 'El condominio', inicial: []
    });
    const condominios = crud.datos;
    const formulario = crud.formulario;
    const esAdmin = usuario.rol === 'admin';
    const actual = usuario.condominios.find((c) => c.id_condominio === usuario.id_condominio);

    async function administrar(condominio) {
        let resultado = await enviar('/api/condominio/seleccionarCondominio', { id_condominio: condominio.id_condominio });
        if (resultado.Success) {
            window.location.href = '/';
        } else {
            crud.avisar('danger', resultado.Mensaje);
        }
    }

    // Después de crear o eliminar se recarga la página completa: así el selector del menú
    // también muestra la lista nueva. Si falla, devuelven el mensaje para mostrarlo.
    async function crear() {
        let resultado = await enviar('/api/condominio/crearCondominio', formulario);
        if (!resultado.Success) {
            return resultado.Mensaje;
        }
        window.location.reload();
    }

    async function eliminar() {
        let resultado = await enviar('/api/condominio/eliminarCondominio', { id_condominio: crud.aEliminar.id_condominio });
        if (resultado.Success) {
            window.location.reload();
            return;
        }
        crud.cancelarEliminar();
        crud.avisar('danger', resultado.Mensaje);
    }

    return (
        <>
            <Encabezado titulo="Condominios"
                descripcion="Resumen de cada condominio. Elija en cuál trabajar: todo el sistema muestra solo sus datos."
                textoBoton="Nuevo condominio" onAdicionar={esAdmin ? () => crud.abrirFormulario(condominioNuevo) : undefined} />
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                { etiqueta: 'Condominios', valor: condominios.length, detalle: cantidad(sumar(condominios, 'departamentos'), 'departamento', 'departamentos') },
                { etiqueta: 'Disponible en total', valor: dineroConSigno(sumar(condominios, 'ingresos') - sumar(condominios, 'egresos')) },
                { etiqueta: 'Por cobrar en total', valor: dinero(sumar(condominios, 'por_cobrar')), tono: 'aviso' },
                {
                    etiqueta: 'En mora en total', valor: dinero(sumar(condominios, 'en_mora')),
                    tono: sumar(condominios, 'en_mora') > 0 ? 'critico' : undefined
                }
            ]} />

            <section className="panel panel-tabla">
                <div className="table-responsive">
                    <table className="table table-hover tabla">
                        <thead>
                            <tr>
                                <th>Condominio</th>
                                <th className="text-end">Departamentos</th>
                                <th className="text-end">Disponible</th>
                                <th className="text-end">Por cobrar</th>
                                <th className="text-end">En mora</th>
                                <th className="text-end columna-acciones">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {condominios.length === 0 && <SinDatos columnas={6} cargando={crud.cargando} />}
                            {condominios.map((condominio) => {
                                let enUso = condominio.id_condominio === usuario.id_condominio;
                                return (
                                    <tr key={condominio.id_condominio}>
                                        <td>
                                            <strong>{condominio.nombre}</strong>
                                            {enUso && <span className="chip">En uso</span>}
                                            <span className="secundario">{condominio.direccion}</span>
                                        </td>
                                        <td className="text-end numero">{condominio.departamentos}</td>
                                        <td className={'text-end numero fw-semibold' + (disponible(condominio) < 0 ? ' baja' : '')}>
                                            {dineroConSigno(disponible(condominio))}
                                        </td>
                                        <td className="text-end numero">{dinero(condominio.por_cobrar)}</td>
                                        <td className={'text-end numero' + (Number(condominio.en_mora) > 0 ? ' texto-deuda fw-semibold' : '')}>
                                            {dinero(condominio.en_mora)}
                                        </td>
                                        {/* Solo se elimina un condominio vacío y que no sea el que está en uso */}
                                        <Acciones onEliminar={esAdmin && !enUso && !condominio.con_movimientos
                                            ? () => crud.confirmarEliminar(condominio) : undefined}>
                                            {enUso
                                                ? <a className="btn btn-sm btn-light" href="/">Ir al panel</a>
                                                : <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => administrar(condominio)}>Administrar</button>}
                                        </Acciones>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {formulario && (
                <Modal titulo="Nuevo condominio" textoAceptar="Crear condominio"
                    descripcion="Sus demás datos (NIT, teléfono, correo) se completan después en Configuración."
                    onCerrar={crud.cerrarFormulario} onAceptar={crear}>
                    <div className="row g-3">
                        <Campo etiqueta="Nombre del condominio" requerido>
                            <input name="nombre" className="form-control" maxLength="120" placeholder="Ej. Condominio Los Jardines"
                                autoFocus value={formulario.nombre} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Dirección" requerido>
                            <input name="direccion" className="form-control" maxLength="200"
                                value={formulario.direccion} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Día de vencimiento de las expensas" requerido ancho="col-md-6" ayuda="Entre 1 y 28.">
                            <input name="dia_vencimiento" type="number" min="1" max="28" className="form-control"
                                value={formulario.dia_vencimiento} onChange={crud.cambiar} />
                        </Campo>
                        <div className="col-12">
                            <Casilla etiqueta={'Copiar los tipos de departamento de ' + actual.nombre}
                                descripcion="Con sus cuotas mensuales. Después puede cambiarlos en Configuración; si no los copia, tendrá que crearlos."
                                marcado={formulario.copiar_tipos} onCambiar={(valor) => crud.actualizarFormulario({ copiar_tipos: valor })} />
                        </div>
                    </div>
                </Modal>
            )}

            {crud.aEliminar && (
                <ConfirmarEliminar titulo="Eliminar condominio" onCerrar={crud.cancelarEliminar} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar el condominio <b>{crud.aEliminar.nombre}</b>? Solo se puede eliminar
                    porque todavía no tiene departamentos, pagos ni gastos.
                </ConfirmarEliminar>
            )}
        </>
    );
}
