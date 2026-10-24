import { useState } from 'react';

// Página para crear una persona
export default function NuevaPersonaPage() {
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Envía los datos a la API
    async function guardarPersona(e) {
        e.preventDefault();
        let datos = { nombre: nombre, telefono: telefono, correo: correo };
        let respuesta = await fetch('/api/persona', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/persona');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Adicionar Persona</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <form onSubmit={guardarPersona}>
                <p>
                    <label>Nombre</label><br />
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} />
                </p>
                <p>
                    <label>Teléfono</label><br />
                    <input value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={25} />
                </p>
                <p>
                    <label>Correo</label><br />
                    <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} maxLength={120} />
                </p>
                <button type="submit">Guardar</button>
                {' '}
                <a href="/persona">Cancelar</a>
            </form>
        </main>
    );
}
