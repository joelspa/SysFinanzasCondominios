import { useState, useEffect } from 'react';

// Página para editar un tipo de departamento
export default function EditarTipoDepartamentoPage({ id }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cuotaMensual, setCuotaMensual] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los datos del tipo de departamento
    useEffect(() => {
        async function obtenerTipoDepartamento() {
            let respuesta = await fetch(`/api/tipo_departamento/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                // la descripción puede venir NULL, se muestra vacía
                setNombre(resultado.Data.nombre);
                setDescripcion(resultado.Data.descripcion || '');
                setCuotaMensual(resultado.Data.cuota_mensual);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerTipoDepartamento();
    }, [id]);

    // Envía los cambios a la API
    async function actualizarTipoDepartamento(e) {
        e.preventDefault();
        let datos = { nombre: nombre, descripcion: descripcion, cuota_mensual: cuotaMensual };
        let respuesta = await fetch(`/api/tipo_departamento/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/tipo_departamento');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Editar Tipo de Departamento</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <form onSubmit={actualizarTipoDepartamento}>
                <p>
                    <label>Nombre</label><br />
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} />
                </p>
                <p>
                    <label>Descripción</label><br />
                    <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={200} />
                </p>
                <p>
                    <label>Cuota mensual</label><br />
                    <input type="number" step="0.01" min="0" value={cuotaMensual} onChange={(e) => setCuotaMensual(e.target.value)} />
                </p>
                <button type="submit">Guardar</button>
                {' '}
                <a href="/tipo_departamento">Cancelar</a>
            </form>
        </main>
    );
}
