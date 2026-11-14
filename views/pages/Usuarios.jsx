import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import { coincide, iniciales } from '../formato';
import { ROLES, LARGO_MINIMO_CONTRASENA, textoRol } from '../opciones';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Resumen from '../components/Resumen';
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
import Casilla from '../components/Casilla';
import Nota from '../components/Nota';
import EntradaContrasena from '../components/EntradaContrasena';

const usuarioNuevo = { id_usuario: 0, nombre: '', correo: '', rol: 'tesorero', activo: true, contrasena: '', confirmacion: '' };

// Usuarios del sistema (quienes registran pagos y gastos). El inicio de sesión usa estos datos.
export default function Usuarios() {
    const crud = useCrud({
        rutas: { obtener: '/api/usuario/obtenerUsuarios', guardar: '/api/usuario/guardarUsuario', eliminar: '/api/usuario/eliminarUsuario' },
        id: 'id_usuario', nombre: 'El usuario', inicial: []
    });
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('');

    const usuarios = crud.datos;
    const formulario = crud.formulario;
    const activos = usuarios.filter((u) => u.activo);
    const filtrados = usuarios.filter((u) => (filtroRol === '' || u.rol === filtroRol) && coincide(busqueda, u.nombre, u.correo));

    function abrir(usuario) {
        crud.abrirFormulario({ ...usuario, contrasena: '', confirmacion: '' });
    }

    // Validaciones del formulario antes de enviar (el servidor vuelve a validar)
    function problema() {
        let esNuevo = formulario.id_usuario == 0;
        if ((esNuevo || formulario.contrasena !== '') && formulario.contrasena.length < LARGO_MINIMO_CONTRASENA) {
            return 'La contraseña debe tener al menos ' + LARGO_MINIMO_CONTRASENA + ' caracteres';
        }
        if (formulario.contrasena !== formulario.confirmacion) {
            return 'Las contraseñas no coinciden';
        }
        return null;
    }

    async function guardar() {
        let error = problema();
        if (error) {
            return error;
        }
        await crud.guardar();
    }

    const rolElegido = formulario ? ROLES.find((r) => r.valor === formulario.rol) : null;

    return (
        <>
            <Encabezado titulo="Usuarios" descripcion="Personas que usan el sistema y registran los movimientos del condominio."
                textoBoton="Nuevo usuario" onAdicionar={() => abrir(usuarioNuevo)} />
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                { etiqueta: 'Usuarios activos', valor: activos.length, detalle: (usuarios.length - activos.length) + ' inactivos' },
                { etiqueta: 'Administradores', valor: activos.filter((u) => u.rol === 'admin').length },
                { etiqueta: 'Tesoreros', valor: activos.filter((u) => u.rol === 'tesorero').length }
            ]} />

            <PanelTabla mostrados={filtrados.length} total={usuarios.length} herramientas={<>
                <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por nombre o correo" />
                <Filtro etiqueta="Filtrar por rol" todos="Todos los roles" opciones={ROLES} valor={filtroRol} onCambiar={setFiltroRol} />
            </>}>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th className="text-end">Movimientos registrados</th>
                        <th>Estado</th>
                        <th className="text-end columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={5} cargando={crud.cargando} filtrado={usuarios.length > 0} />}
                    {filtrados.map((usuario) => (
                        <tr key={usuario.id_usuario} className={usuario.activo ? '' : 'anulado'}>
                            <td>
                                <div className="celda-persona">
                                    <span className="avatar">{iniciales(usuario.nombre)}</span>
                                    <div>
                                        <strong>{usuario.nombre}</strong>
                                        <span className="secundario">{usuario.correo}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{textoRol(usuario.rol)}</td>
                            <td className="text-end numero">{usuario.movimientos}</td>
                            <td><Estado valor={usuario.activo ? 'activo' : 'inactivo'} /></td>
                            {/* Quien registró movimientos no se elimina (historial): solo se desactiva */}
                            <Acciones onEditar={() => abrir(usuario)}
                                onEliminar={usuario.movimientos === 0 ? () => crud.confirmarEliminar(usuario) : undefined} />
                        </tr>
                    ))}
                </tbody>
            </PanelTabla>

            {formulario && (
                <Modal titulo={formulario.id_usuario == 0 ? 'Nuevo usuario' : 'Editar usuario'}
                    descripcion="Los permisos de cada rol se aplicarán cuando se active el inicio de sesión."
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Nombre completo" requerido>
                            <input name="nombre" className="form-control" maxLength="120" autoFocus
                                value={formulario.nombre} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Correo electrónico" requerido ayuda="Es el dato con el que inicia sesión.">
                            <input name="correo" type="email" className="form-control" maxLength="120" autoComplete="off"
                                value={formulario.correo} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Rol" requerido ancho="col-md-6" ayuda={rolElegido ? rolElegido.descripcion : undefined}>
                            <select name="rol" className="form-select" value={formulario.rol} onChange={crud.cambiar}>
                                <Opciones lista={ROLES} />
                            </select>
                        </Campo>
                        <div className="col-md-6 d-flex align-items-center">
                            <Casilla etiqueta="Usuario activo" descripcion="Si se desactiva, no podrá iniciar sesión."
                                marcado={formulario.activo} onCambiar={(valor) => crud.actualizarFormulario({ activo: valor })} />
                        </div>
                        {formulario.id_usuario != 0 && (
                            <div className="col-12">
                                <Nota tono="info">Deje la contraseña vacía para mantener la actual.</Nota>
                            </div>
                        )}
                        <Campo etiqueta={formulario.id_usuario == 0 ? 'Contraseña' : 'Nueva contraseña'}
                            requerido={formulario.id_usuario == 0} ancho="col-md-6" ayuda={'Mínimo ' + LARGO_MINIMO_CONTRASENA + ' caracteres.'}>
                            <EntradaContrasena name="contrasena" valor={formulario.contrasena} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Repetir contraseña" requerido={formulario.id_usuario == 0} ancho="col-md-6">
                            <EntradaContrasena name="confirmacion" valor={formulario.confirmacion} onChange={crud.cambiar} />
                        </Campo>
                    </div>
                </Modal>
            )}

            {crud.aEliminar && (
                <ConfirmarEliminar titulo="Eliminar usuario" onCerrar={crud.cancelarEliminar} onAceptar={crud.eliminar}>
                    ¿Está seguro que desea eliminar al usuario <b>{crud.aEliminar.nombre}</b>?
                </ConfirmarEliminar>
            )}
        </>
    );
}
