import { useState, useEffect } from 'react';

// Página para editar un ingreso
export default function EditarIngresoPage({ id }) {
    const [idDepartamento, setIdDepartamento] = useState('');
    const [idTipoIngreso, setIdTipoIngreso] = useState('');
    const [concepto, setConcepto] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [estado, setEstado] = useState('registrado');
    const [departamentos, setDepartamentos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los select y los datos del ingreso
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

        async function obtenerTiposIngreso() {
            let respuesta = await fetch('/api/tipo_ingreso');
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setTipos(resultado.Data);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        async function obtenerIngreso() {
            let respuesta = await fetch(`/api/ingreso/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setIdDepartamento(resultado.Data.id_departamento);
                setIdTipoIngreso(resultado.Data.id_tipo_ingreso);
                setConcepto(resultado.Data.concepto);
                setMonto(resultado.Data.monto);
                setFecha(resultado.Data.fecha);
                setMetodoPago(resultado.Data.metodo_pago);
                setEstado(resultado.Data.estado);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerDepartamentos();
        obtenerTiposIngreso();
        obtenerIngreso();
    }, [id]);

    // Si el tipo es "Expensas", pone en el monto la cuota mensual del tipo de departamento
    // (solo cuando el usuario cambia un select, así no se pisa el monto guardado)
    function llenarMontoExpensas(id_departamento, id_tipo_ingreso) {
        let tipo = tipos.find((t) => t.id_tipo_ingreso == id_tipo_ingreso);
        let departamento = departamentos.find((d) => d.id_departamento == id_departamento);
        if (tipo && tipo.nombre == 'Expensas' && departamento) {
            setMonto(departamento.cuota_mensual);
        }
    }

    function cambiarDepartamento(e) {
        setIdDepartamento(e.target.value);
        llenarMontoExpensas(e.target.value, idTipoIngreso);
    }

    function cambiarTipoIngreso(e) {
        setIdTipoIngreso(e.target.value);
        llenarMontoExpensas(idDepartamento, e.target.value);
    }

    // Envía los cambios a la API
    async function actualizarIngreso(e) {
        e.preventDefault();
        let datos = {
            id_departamento: idDepartamento, id_tipo_ingreso: idTipoIngreso, concepto: concepto,
            monto: monto, fecha: fecha, metodo_pago: metodoPago, estado: estado
        };
        let respuesta = await fetch(`/api/ingreso/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/ingreso');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Editar Ingreso</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <form onSubmit={actualizarIngreso}>
                <p>
                    <label>Departamento</label><br />
                    <select value={idDepartamento} onChange={cambiarDepartamento}>
                        <option value="">-- Seleccione --</option>
                        {departamentos.map((departamento) => (
                            <option key={departamento.id_departamento} value={departamento.id_departamento}>
                                {departamento.numero} - {departamento.tipo_departamento}
                            </option>
                        ))}
                    </select>
                </p>
                <p>
                    <label>Tipo de ingreso</label><br />
                    <select value={idTipoIngreso} onChange={cambiarTipoIngreso}>
                        <option value="">-- Seleccione --</option>
                        {tipos.map((tipo) => (
                            <option key={tipo.id_tipo_ingreso} value={tipo.id_tipo_ingreso}>{tipo.nombre}</option>
                        ))}
                    </select>
                </p>
                <p>
                    <label>Concepto</label><br />
                    <input value={concepto} onChange={(e) => setConcepto(e.target.value)} maxLength={180} />
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
                <a href="/ingreso">Cancelar</a>
            </form>
        </main>
    );
}
