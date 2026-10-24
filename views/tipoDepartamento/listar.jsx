import { useState, useEffect } from 'react';

// Página que lista los tipos de departamento
export default function TipoDepartamentoPage() {
    const [tipos, setTipos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los tipos de departamento
    useEffect(() => {
        async function obtenerTiposDepartamento() {
            let respuesta = await fetch('/api/tipo_departamento');
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setTipos(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerTiposDepartamento();
    }, []);

    return (
        <main style={{ padding: 20 }}>
            <h2>Tipos de Departamento</h2>
            <p><a href="/tipo_departamento/nuevo">Adicionar</a></p>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Cuota mensual</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tipos.map((tipo) => (
                        <tr key={tipo.id_tipo_departamento}>
                            <td>{tipo.id_tipo_departamento}</td>
                            <td>{tipo.nombre}</td>
                            <td>{tipo.descripcion}</td>
                            <td>{tipo.cuota_mensual}</td>
                            <td>
                                <a href={`/tipo_departamento/${tipo.id_tipo_departamento}/editar`}>Editar</a>
                                {' | '}
                                <a href={`/tipo_departamento/${tipo.id_tipo_departamento}/eliminar`}>Eliminar</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
