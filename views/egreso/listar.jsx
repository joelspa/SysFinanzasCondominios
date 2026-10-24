import { useState, useEffect } from 'react';

// Página que lista los egresos
export default function EgresoPage() {
    const [egresos, setEgresos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los egresos
    useEffect(() => {
        async function obtenerEgresos() {
            let respuesta = await fetch('/api/egreso');
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setEgresos(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerEgresos();
    }, []);

    return (
        <main style={{ padding: 20 }}>
            <h2>Egresos</h2>
            <p><a href="/egreso/nuevo">Adicionar</a></p>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <table border="1" cellPadding="6">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Tipo</th>
                        <th>Monto</th>
                        <th>Método de pago</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {egresos.map((egreso) => (
                        <tr key={egreso.id_egreso}>
                            <td>{egreso.id_egreso}</td>
                            <td>{egreso.fecha}</td>
                            <td>{egreso.concepto}</td>
                            <td>{egreso.tipo_egreso}</td>
                            <td>{egreso.monto}</td>
                            <td>{egreso.metodo_pago}</td>
                            <td>{egreso.estado}</td>
                            <td>
                                <a href={`/egreso/${egreso.id_egreso}/editar`}>Editar</a>
                                {' | '}
                                <a href={`/egreso/${egreso.id_egreso}/eliminar`}>Eliminar</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
