import { useState } from 'react';
import Icono from './Icono';
import useDatos from '../hooks/useDatos';
import { fechaLarga } from '../formato';

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

// Menú lateral y barra superior (en celular el menú se abre con el botón de la barra)
export default function Menu({ ruta }) {
    const [abierto, setAbierto] = useState(false);
    const condominio = useDatos('/api/condominio/obtenerCondominio', null);
    let actual = grupos.flatMap((grupo) => grupo.opciones).find((opcion) => perteneceA(ruta, opcion));
    let nombre = condominio.datos ? condominio.datos.nombre : 'Finanzas Condominio';

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
                    {grupos.map((grupo) => (
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
                    <span className="avatar">AD</span>
                    <span>
                        <strong>Administrador</strong>
                        <small>admin@condominio.com</small>
                    </span>
                </div>
            </aside>
            <div className={'menu-fondo' + (abierto ? ' visible' : '')} onClick={() => setAbierto(false)}></div>

            <header className="barra-superior">
                <button type="button" className="boton-menu" aria-label="Abrir menú" onClick={() => setAbierto(true)}>
                    <Icono nombre="menu" tamano={22} />
                </button>
                <div className="barra-ruta">
                    {nombre} <span className="mx-1">/</span>
                    {subpaginas[ruta] ? (
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
        </>
    );
}
