import { useState, useEffect } from 'react';

// Página para confirmar la eliminación de un egreso
export default function EliminarEgresoPage({ id }) {
    const [egreso, setEgreso] = useState(null);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los datos del egreso
    useEffect(() => {
        async function obtenerEgreso() {
            let respuesta = await fetch(`/api/egreso/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setEgreso(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerEgreso();
    }, [id]);

    // Pide a la API que elimine el egreso
    async function eliminarEgreso() {
        let respuesta = await fetch(`/api/egreso/${id}`, { method: 'DELETE' });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/egreso');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Eliminar Egreso</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            {egreso && (
                <div>
                    <p>¿Está seguro que desea eliminar el egreso &apos;{egreso.concepto}&apos; de {egreso.monto} ({egreso.fecha})?</p>
                    <button onClick={eliminarEgreso}>Aceptar</button>
                    {' '}
                    <a href="/egreso">Cancelar</a>
                </div>
            )}
            {!egreso && <a href="/egreso">Volver</a>}
        </main>
    );
}
