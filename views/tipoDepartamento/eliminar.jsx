import { useState, useEffect } from 'react';

// Página para confirmar la eliminación de un tipo de departamento
export default function EliminarTipoDepartamentoPage({ id }) {
    const [tipo, setTipo] = useState(null);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los datos del tipo de departamento
    useEffect(() => {
        async function obtenerTipoDepartamento() {
            let respuesta = await fetch(`/api/tipo_departamento/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setTipo(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerTipoDepartamento();
    }, [id]);

    // Pide a la API que elimine el tipo de departamento
    async function eliminarTipoDepartamento() {
        let respuesta = await fetch(`/api/tipo_departamento/${id}`, { method: 'DELETE' });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/tipo_departamento');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Eliminar Tipo de Departamento</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            {tipo && (
                <div>
                    <p>¿Está seguro que desea eliminar el tipo de departamento &apos;{tipo.nombre}&apos;?</p>
                    <button onClick={eliminarTipoDepartamento}>Aceptar</button>
                    {' '}
                    <a href="/tipo_departamento">Cancelar</a>
                </div>
            )}
            {!tipo && <a href="/tipo_departamento">Volver</a>}
        </main>
    );
}
