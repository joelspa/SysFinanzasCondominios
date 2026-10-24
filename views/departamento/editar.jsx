import { useState, useEffect } from 'react';

// Página para editar un departamento
export default function EditarDepartamentoPage({ id }) {
    const [numero, setNumero] = useState('');
    const [piso, setPiso] = useState('');
    const [estado, setEstado] = useState('activo');
    const [idTipoDepartamento, setIdTipoDepartamento] = useState('');
    const [metrosCuadrados, setMetrosCuadrados] = useState('');
    const [tipos, setTipos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // Al abrir la página se cargan los tipos para el select y los datos del departamento
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

        async function obtenerDepartamento() {
            let respuesta = await fetch(`/api/departamento/${id}`);
            let resultado = await respuesta.json();
            if (resultado.Success) {
                setNumero(resultado.Data.numero);
                setPiso(resultado.Data.piso);
                setEstado(resultado.Data.estado);
                setIdTipoDepartamento(resultado.Data.id_tipo_departamento);
                setMetrosCuadrados(resultado.Data.metros_cuadrados);
            } else {
                setMensaje(resultado.Mensaje);
            }
        }

        obtenerTiposDepartamento();
        obtenerDepartamento();
    }, [id]);

    // Envía los cambios a la API
    async function actualizarDepartamento(e) {
        e.preventDefault();
        let datos = {
            numero: numero, piso: piso, estado: estado,
            id_tipo_departamento: idTipoDepartamento, metros_cuadrados: metrosCuadrados
        };
        let respuesta = await fetch(`/api/departamento/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        let resultado = await respuesta.json();
        if (resultado.Success) {
            window.location.assign('/departamento');
        } else {
            setMensaje(resultado.Mensaje);
        }
    }

    return (
        <main style={{ padding: 20 }}>
            <h2>Editar Departamento</h2>
            {mensaje && <p style={{ color: 'red' }}>{mensaje}</p>}
            <form onSubmit={actualizarDepartamento}>
                <p>
                    <label>Número</label><br />
                    <input value={numero} onChange={(e) => setNumero(e.target.value)} maxLength={15} />
                </p>
                <p>
                    <label>Piso</label><br />
                    <input type="number" value={piso} onChange={(e) => setPiso(e.target.value)} />
                </p>
                <p>
                    <label>Tipo</label><br />
                    <select value={idTipoDepartamento} onChange={(e) => setIdTipoDepartamento(e.target.value)}>
                        <option value="">-- Seleccione --</option>
                        {tipos.map((tipo) => (
                            <option key={tipo.id_tipo_departamento} value={tipo.id_tipo_departamento}>{tipo.nombre}</option>
                        ))}
                    </select>
                </p>
                <p>
                    <label>Metros cuadrados</label><br />
                    <input type="number" step="0.01" min="0" value={metrosCuadrados} onChange={(e) => setMetrosCuadrados(e.target.value)} />
                </p>
                <p>
                    <label>Estado</label><br />
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="activo">activo</option>
                        <option value="inactivo">inactivo</option>
                    </select>
                </p>
                <button type="submit">Guardar</button>
                {' '}
                <a href="/departamento">Cancelar</a>
            </form>
        </main>
    );
}
