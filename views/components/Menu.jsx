import { useState } from 'react';
import Icono from './Icono';
import Alerta from './Alerta';
import ModalContrasena from '../secciones/ModalContrasena';
import useDatos from '../hooks/useDatos';
import { enviar } from '../api';
import { fechaLarga, iniciales } from '../formato';
import { RUTAS_ADMIN, textoRol } from '../opciones';

const grupos = [
    { titulo: 'General', opciones: [{ ruta: '/', texto: 'Panel principal', icono: 'inicio' }] },
    {
        titulo: 'Finanzas', opciones: [
            { ruta: '/ingreso', texto: 'Ingresos', icono: 'ingresos' },
            { ruta: '/egreso', texto: 'Gastos', icono: 'gastos' },
            { ruta: '/cargo', texto: 'Cuentas por cobrar', icono: 'cargos' }
        ]
    },
    {
        titulo: 'Administración', opciones: [
            { ruta: '/departamento', texto: 'Departamentos', icono: 'departamentos' },
            { ruta: '/residente', texto: 'Residentes', icono: 'residentes' },
            { ruta: '/persona', texto: 'Personas', icono: 'personas' }
        ]
    },
    {
        titulo: 'Sistema', opciones: [
            { ruta: '/configuracion', texto: 'Configuración', icono: 'ajustes' },
            { ruta: '/usuario', texto: 'Usuarios', icono: 'usuarios' }
        ]
    }
];

// Páginas de detalle: se marcan dentro de su sección del menú
const subpaginas = {
    '/departamento/ficha': 'Ficha del departamento',
    '/ingreso/comprobante': 'Comprobante',
    '/egreso/comprobante': 'Comprobante'
};

function perteneceA(ruta, opcion) {
    return ruta === opcion.ruta || (opcion.ruta !== '/' && ruta.startsWith(opcion.ruta + '/'));
}

// Grupos del menú que puede ver el usuario: las páginas de RUTAS_ADMIN son solo del administrador
function gruposPara(usuario) {
    return grupos
        .map((grupo) => ({
            ...grupo, opciones: grupo.opciones.filter((o) => usuario.rol === 'admin' || !RUTAS_ADMIN.includes(o.ruta))
        }))
        .filter((grupo) => grupo.opciones.length > 0);
}

// Menú lateral y barra superior (en celular el menú se abre con el botón de la barra)
//   usuario: quien tiene la sesión abierta { nombre, correo, rol }
export default function Menu({ ruta, usuario }) {
    const [abierto, setAbierto] = useState(false);
    const [cambiandoContrasena, setCambiandoContrasena] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const condominio = useDatos('/api/condominio/obtenerCondominio', null);

    const visibles = gruposPara(usuario);
    let actual = visibles.flatMap((grupo) => grupo.opciones).find((opcion) => perteneceA(ruta, opcion));
    let nombre = condominio.datos ? condominio.datos.nombre : 'Finanzas Condominio';

    async function cerrarSesion() {
        await enviar('/api/sesion/cerrarSesion', {});
        window.location.href = '/login';
    }

    function contrasenaCambiada() {
        setCambiandoContrasena(false);
        setMensaje({ tipo: 'success', texto: 'Su contraseña se cambió correctamente' });
    }

    return (
        <>
            <aside className={'menu-lateral' + (abierto ? ' abierto' : '')}>
                <a className="menu-marca" href="/">
                    <span className="menu-logo"><Icono nombre="departamentos" tamano={20} /></span>
                    <span>
                        <strong>{nombre}</strong>
                        <small>Finanzas y administración</small>
                    </span>
                </a>
                <nav className="menu-navegacion">
                    {visibles.map((grupo) => (
                        <div key={grupo.titulo}>
                            <div className="menu-grupo">{grupo.titulo}</div>
                            {grupo.opciones.map((opcion) => (
                                <a key={opcion.ruta} href={opcion.ruta}
                                    className={'menu-enlace' + (perteneceA(ruta, opcion) ? ' activo' : '')}>
                                    <Icono nombre={opcion.icono} />
                                    {opcion.texto}
                                </a>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="menu-usuario">
                    <span className="avatar">{iniciales(usuario.nombre)}</span>
                    <span className="menu-usuario-datos" title={usuario.correo}>
                        <strong>{usuario.nombre}</strong>
                        <small>{textoRol(usuario.rol)}</small>
                    </span>
                    <button type="button" className="boton-icono" title="Cambiar mi contraseña" aria-label="Cambiar mi contraseña"
                        onClick={() => setCambiandoContrasena(true)}>
                        <Icono nombre="llave" tamano={17} />
                    </button>
                    <button type="button" className="boton-icono" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={cerrarSesion}>
                        <Icono nombre="salir" tamano={17} />
                    </button>
                </div>
            </aside>
            <div className={'menu-fondo' + (abierto ? ' visible' : '')} onClick={() => setAbierto(false)}></div>

            <header className="barra-superior">
                <button type="button" className="boton-menu" aria-label="Abrir menú" onClick={() => setAbierto(true)}>
                    <Icono nombre="menu" tamano={22} />
                </button>
                <div className="barra-ruta">
                    {nombre} <span className="mx-1">/</span>
                    {subpaginas[ruta] && actual ? (
                        <><a href={actual.ruta}>{actual.texto}</a> <span className="mx-1">/</span> <strong>{subpaginas[ruta]}</strong></>
                    ) : (
                        <strong>{actual ? actual.texto : 'Panel principal'}</strong>
                    )}
                </div>
                <div className="barra-fecha ms-auto">
                    <Icono nombre="calendario" tamano={16} />
                    {fechaLarga()}
                </div>
            </header>

            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />
            {cambiandoContrasena && (
                <ModalContrasena onCerrar={() => setCambiandoContrasena(false)} onCambiada={contrasenaCambiada} />
            )}
        </>
    );
}
