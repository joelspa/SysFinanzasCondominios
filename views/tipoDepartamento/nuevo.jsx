import { useState } from 'react';

// Página para crear un tipo de departamento
export default function NuevoTipoDepartamentoPage() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cuotaMensual, setCuotaMensual] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Envía los datos a la API
    async function guardarTipoDepartamento(e) {
        e.preventDefault();
        let datos = { nombre: nombre, descripcion: descripcion, cuota_mensual: cuotaMensual };
        let respuesta = await fetch('/api/tipo_departamento', {
            method: 'POST',
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
            <h2>Adicionar Tipo de Departamento</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <form onSubmit={guardarTipoDepartamento}>
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
