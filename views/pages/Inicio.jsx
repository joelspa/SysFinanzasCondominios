const modulos = [
    { ruta: '/persona', titulo: 'Personas', descripcion: 'Registro de propietarios, inquilinos y familiares.' },
    { ruta: '/departamento', titulo: 'Departamentos', descripcion: 'Departamentos del condominio con su tipo y superficie.' },
    { ruta: '/residente', titulo: 'Residentes', descripcion: 'Asigna una persona a un departamento (requiere ambos registrados).' },
    { ruta: '/ingreso', titulo: 'Ingresos', descripcion: 'Pagos de expensas, multas y otros ingresos de cada departamento.' }
];

export default function Inicio() {
    return (
        <>
            <div className="p-4 mb-4 bg-white rounded-3 shadow-sm">
                <h1 className="h3">Sistema de Gestión de Finanzas para Condominios</h1>
                <p className="text-muted mb-0">Administre las personas, los departamentos, los residentes y los ingresos del condominio.</p>
            </div>
            <div className="row g-3">
                {modulos.map((modulo) => (
                    <div className="col-md-6 col-lg-3" key={modulo.ruta}>
                        <a href={modulo.ruta} className="card h-100 shadow-sm text-decoration-none">
                            <div className="card-body">
                                <h5 className="card-title text-primary">{modulo.titulo}</h5>
                                <p className="card-text text-muted">{modulo.descripcion}</p>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </>
    );
}
