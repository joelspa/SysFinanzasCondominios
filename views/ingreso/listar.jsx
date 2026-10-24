import { useState, useEffect } from 'react';

// Página que lista los ingresos
export default function IngresoPage() {
    const [ingresos, setIngresos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los ingresos
    useEffect(() => {
        async function obtenerIngresos() {
            let respuesta = await fetch('/api/ingreso');
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setIngresos(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerIngresos();
    }, []);

    return (
        <main style={{ padding: 20 }}>
            <h2>Ingresos</h2>
            <p><a href="/ingreso/nuevo">Adicionar</a></p>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Fecha</th>
                        <th>Departamento</th>
                        <th>Tipo</th>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Método de pago</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {ingresos.map((ingreso) => (
                        <tr key={ingreso.id_ingreso}>
                            <td>{ingreso.id_ingreso}</td>
                            <td>{ingreso.fecha}</td>
                            <td>{ingreso.numero_departamento}</td>
                            <td>{ingreso.tipo_ingreso}</td>
                            <td>{ingreso.concepto}</td>
                            <td>{ingreso.monto}</td>
                            <td>{ingreso.metodo_pago}</td>
                            <td>{ingreso.estado}</td>
                            <td>
                                <a href={`/ingreso/${ingreso.id_ingreso}/editar`}>Editar</a>
                                {' | '}
                                <a href={`/ingreso/${ingreso.id_ingreso}/eliminar`}>Eliminar</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
