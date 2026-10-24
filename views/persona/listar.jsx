import { useState, useEffect } from 'react';

// Página que lista las personas
export default function PersonaPage() {
    const [personas, setPersonas] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan las personas
    useEffect(() => {
        async function obtenerPersonas() {
            let respuesta = await fetch('/api/persona');
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setPersonas(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerPersonas();
    }, []);

    return (
        <main style={{ padding: 20 }}>
            <h2>Personas</h2>
            <p><a href="/persona/nuevo">Adicionar</a></p>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {personas.map((persona) => (
                        <tr key={persona.id_persona}>
                            <td>{persona.id_persona}</td>
                            <td>{persona.nombre}</td>
                            <td>{persona.telefono}</td>
                            <td>{persona.correo}</td>
                            <td>
                                <a href={`/persona/${persona.id_persona}/editar`}>Editar</a>
                                {' | '}
                                <a href={`/persona/${persona.id_persona}/eliminar`}>Eliminar</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
