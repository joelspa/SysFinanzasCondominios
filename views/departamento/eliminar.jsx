import { useState, useEffect } from 'react';

// Página para confirmar la eliminación de un departamento
export default function EliminarDepartamentoPage({ id }) {
    const [departamento, setDepartamento] = useState(null);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los datos del departamento
    useEffect(() => {
        async function obtenerDepartamento() {
            let respuesta = await fetch(`/api/departamento/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setDepartamento(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerDepartamento();
    }, [id]);

    // Pide a la API que elimine el departamento
    async function eliminarDepartamento() {
        let respuesta = await fetch(`/api/departamento/${id}`, { method: 'DELETE' });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/departamento');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Eliminar Departamento</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            {departamento && (
                <div>
                    <p>¿Está seguro que desea eliminar el departamento &apos;{departamento.numero}&apos; (piso {departamento.piso})?</p>
                    <button onClick={eliminarDepartamento}>Aceptar</button>
                    {' '}
                    <a href="/departamento">Cancelar</a>
                </div>
            )}
            {!departamento && <a href="/departamento">Volver</a>}
        </main>
    );
}
