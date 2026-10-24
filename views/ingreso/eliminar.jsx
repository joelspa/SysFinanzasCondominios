import { useState, useEffect } from 'react';

// Página para confirmar la eliminación de un ingreso
export default function EliminarIngresoPage({ id }) {
    const [ingreso, setIngreso] = useState(null);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los datos del ingreso
    useEffect(() => {
        async function obtenerIngreso() {
            let respuesta = await fetch(`/api/ingreso/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setIngreso(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerIngreso();
    }, [id]);

    // Pide a la API que elimine el ingreso
    async function eliminarIngreso() {
        let respuesta = await fetch(`/api/ingreso/${id}`, { method: 'DELETE' });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/ingreso');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Eliminar Ingreso</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            {ingreso && (
                <div>
                    <p>¿Está seguro que desea eliminar el ingreso &apos;{ingreso.concepto}&apos; de {ingreso.monto} del departamento {ingreso.numero_departamento} ({ingreso.fecha})?</p>
                    <button onClick={eliminarIngreso}>Aceptar</button>
                    {' '}
                    <a href="/ingreso">Cancelar</a>
                </div>
            )}
            {!ingreso && <a href="/ingreso">Volver</a>}
        </main>
    );
}
