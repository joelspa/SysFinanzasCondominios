const opciones = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/persona', texto: 'Personas' },
    { ruta: '/departamento', texto: 'Departamentos' },
    { ruta: '/residente', texto: 'Residentes' },
    { ruta: '/ingreso', texto: 'Ingresos' }
];

// Barra de navegación superior
export default function Menu({ ruta }) {
    return (
        <nav className="navbar navbar-expand navbar-dark bg-primary shadow-sm mb-4">
            <div className="container">
                <a className="navbar-brand fw-semibold" href="/">Finanzas del Condominio</a>
                <ul className="navbar-nav ms-auto">
                    {opciones.map((opcion) => (
                        <li className="nav-item" key={opcion.ruta}>
                            <a className={'nav-link' + (opcion.ruta === ruta ? ' active' : '')} href={opcion.ruta}>
                                {opcion.texto}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
