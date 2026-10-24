// Página de inicio: menú con los módulos del sistema
export default function Home() {
    return (
        <main style={{ padding: 20 }}>
            <h1>Finanzas del Condominio</h1>
            <ul>
                <li><a href="/tipo_departamento">Tipos de Departamento</a></li>
                <li><a href="/departamento">Departamentos</a></li>
                <li><a href="/persona">Personas</a></li>
                <li><a href="/ingreso">Ingresos</a></li>
                <li><a href="/egreso">Egresos</a></li>
            </ul>
        </main>
    );
}
