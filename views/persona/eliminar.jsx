import { useState, useEffect } from 'react';

// Página para confirmar la eliminación de una persona
export default function EliminarPersonaPage({ id }) {
    const [persona, setPersona] = useState(null);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los datos de la persona
    useEffect(() => {
        async function obtenerPersona() {
            let respuesta = await fetch(`/api/persona/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setPersona(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerPersona();
    }, [id]);

    // Pide a la API que elimine la persona
    async function eliminarPersona() {
        let respuesta = await fetch(`/api/persona/${id}`, { method: 'DELETE' });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/persona');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Eliminar Persona</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            {persona && (
                <div>
                    <p>¿Está seguro que desea eliminar a la persona &apos;{persona.nombre}&apos;?</p>
                    <button onClick={eliminarPersona}>Aceptar</button>
                    {' '}
                    <a href="/persona">Cancelar</a>
                </div>
            )}
            {!persona && <a href="/persona">Volver</a>}
        </main>
    );
}
