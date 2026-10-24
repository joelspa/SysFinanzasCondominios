import { useState, useEffect } from 'react';

// Página para editar una persona
export default function EditarPersonaPage({ id }) {
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los datos de la persona
    useEffect(() => {
        async function obtenerPersona() {
            let respuesta = await fetch(`/api/persona/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                // teléfono y correo pueden venir NULL, se muestran vacíos
                setNombre(resultado.Data.nombre);
                setTelefono(resultado.Data.telefono || '');
                setCorreo(resultado.Data.correo || '');
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerPersona();
    }, [id]);

    // Envía los cambios a la API
    async function actualizarPersona(e) {
        e.preventDefault();
        let datos = { nombre: nombre, telefono: telefono, correo: correo };
        let respuesta = await fetch(`/api/persona/${id}`, {
            method: 'PUT',
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
            <h2>Editar Persona</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <form onSubmit={actualizarPersona}>
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
