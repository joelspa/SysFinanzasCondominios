import { useState, useEffect } from 'react';

// Página para editar un egreso
export default function EditarEgresoPage({ id }) {
    const [concepto, setConcepto] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState('');
    const [idTipoEgreso, setIdTipoEgreso] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [estado, setEstado] = useState('registrado');
    const [tipos, setTipos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los tipos para el select y los datos del egreso
    useEffect(() => {
        async function obtenerTiposEgreso() {
            let respuesta = await fetch('/api/tipo_egreso');
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setTipos(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        async function obtenerEgreso() {
            let respuesta = await fetch(`/api/egreso/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setConcepto(resultado.Data.concepto);
                setMonto(resultado.Data.monto);
                setFecha(resultado.Data.fecha);
                setIdTipoEgreso(resultado.Data.id_tipo_egreso);
                setMetodoPago(resultado.Data.metodo_pago);
                setEstado(resultado.Data.estado);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerTiposEgreso();
        obtenerEgreso();
    }, [id]);

    // Envía los cambios a la API
    async function actualizarEgreso(e) {
        e.preventDefault();
        let datos = {
            concepto: concepto, monto: monto, fecha: fecha, estado: estado,
            id_tipo_egreso: idTipoEgreso, metodo_pago: metodoPago
        };
        let respuesta = await fetch(`/api/egreso/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/egreso');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Editar Egreso</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <form onSubmit={actualizarEgreso}>
                <p>
                    <label>Concepto</label><br />
                    <input value={concepto} onChange={(e) => setConcepto(e.target.value)} maxLength={180} />
                </p>
                <p>
                    <label>Tipo</label><br />
                    <select value={idTipoEgreso} onChange={(e) => setIdTipoEgreso(e.target.value)}>
                        <option value="">-- Seleccione --</option>
                        {tipos.map((tipo) => (
                            <option key={tipo.id_tipo_egreso} value={tipo.id_tipo_egreso}>{tipo.nombre}</option>
                        ))}
                    </select>
                </p>
                <p>
                    <label>Monto</label><br />
                    <input type="number" step="0.01" min="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} />
                </p>
                <p>
                    <label>Fecha</label><br />
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </p>
                <p>
                    <label>Método de pago</label><br />
                    <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                        <option value="">-- Seleccione --</option>
                        <option value="efectivo">efectivo</option>
                        <option value="transferencia">transferencia</option>
                        <option value="QR">QR</option>
                    </select>
                </p>
                <p>
                    <label>Estado</label><br />
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="registrado">registrado</option>
                        <option value="anulado">anulado</option>
                    </select>
                </p>
                <button type="submit">Guardar</button>
                {' '}
                <a href="/egreso">Cancelar</a>
            </form>
        </main>
    );
}
