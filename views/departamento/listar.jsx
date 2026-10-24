import { useState, useEffect } from 'react';

// Página que lista los departamentos
export default function DepartamentoPage() {
    const [departamentos, setDepartamentos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los departamentos
    useEffect(() => {
        async function obtenerDepartamentos() {
            let respuesta = await fetch('/api/departamento');
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setDepartamentos(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerDepartamentos();
    }, []);

    return (
        <main style={{ padding: 20 }}>
            <h2>Departamentos</h2>
            <p><a href="/departamento/nuevo">Adicionar</a></p>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Número</th>
                        <th>Piso</th>
                        <th>Tipo</th>
                        <th>m2</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {departamentos.map((departamento) => (
                        <tr key={departamento.id_departamento}>
                            <td>{departamento.id_departamento}</td>
                            <td>{departamento.numero}</td>
                            <td>{departamento.piso}</td>
                            <td>{departamento.tipo_departamento}</td>
                            <td>{departamento.metros_cuadrados}</td>
                            <td>{departamento.estado}</td>
                            <td>
                                <a href={`/departamento/${departamento.id_departamento}/editar`}>Editar</a>
                                {' | '}
                                <a href={`/departamento/${departamento.id_departamento}/eliminar`}>Eliminar</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
