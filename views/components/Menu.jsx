import { useState } from 'react';
import Icono from './Icono';
import { fechaLarga } from '../formato';

const grupos = [
    { titulo: 'General', opciones: [{ ruta: '/', texto: 'Panel principal', icono: 'inicio' }] },
    { titulo: 'Finanzas', opciones: [{ ruta: '/ingreso', texto: 'Ingresos', icono: 'ingresos' }] },
    {
        titulo: 'Administración', opciones: [
            { ruta: '/departamento', texto: 'Departamentos', icono: 'departamentos' },
            { ruta: '/residente', texto: 'Residentes', icono: 'residentes' },
            { ruta: '/persona', texto: 'Personas', icono: 'personas' }
        ]
    }
];

// Menú lateral y barra superior (en celular el menú se abre con el botón de la barra)
export default function Menu({ ruta }) {
    const [abierto, setAbierto] = useState(false);
    let actual = grupos.flatMap((grupo) => grupo.opciones).find((opcion) => opcion.ruta === ruta);

    return (
        <>
            <aside className={'menu-lateral' + (abierto ? ' abierto' : '')}>
                <a className="menu-marca" href="/">
                    <span className="menu-logo"><Icono nombre="departamentos" tamano={20} /></span>
                    <span>
                        <strong>Finanzas Condominio</strong>
                        <small>Gestión administrativa</small>
                    </span>
                </a>
                <nav className="menu-navegacion">
                    {grupos.map((grupo) => (
                        <div key={grupo.titulo}>
                            <div className="menu-grupo">{grupo.titulo}</div>
                            {grupo.opciones.map((opcion) => (
                                <a key={opcion.ruta} href={opcion.ruta}
                                    className={'menu-enlace' + (opcion.ruta === ruta ? ' activo' : '')}>
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
                    Finanzas Condominio <span className="mx-1">/</span> <strong>{actual ? actual.texto : 'Panel principal'}</strong>
                </div>
                <div className="barra-fecha ms-auto">
                    <Icono nombre="calendario" tamano={16} />
                    {fechaLarga()}
                </div>
            </header>
        </>
    );
}
