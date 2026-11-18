import Icono from './Icono';

const ANCHOS = ['92%', '78%', '86%', '64%'];   // filas de la silueta, de distinto largo para que parezcan datos

// Lo que muestra una tabla cuando no tiene filas:
//   - cargando: la silueta de unas filas que brillan
//   - filtrado: ningún registro coincide con la búsqueda
//   - vacía: qué va a aparecer aquí y el botón para empezar
//   titulo, texto: explicación propia de la tabla vacía (opcional)
//   accion: { texto, onClick } botón para crear el primer registro (opcional)
export default function SinDatos({ columnas, cargando, filtrado, titulo, texto, accion }) {
    if (cargando) {
        return ANCHOS.map((ancho, i) => (
            <tr key={i} aria-hidden="true">
                <td colSpan={columnas} className="fila-esqueleto"><div className="esqueleto esqueleto-linea" style={{ width: ancho }} /></td>
            </tr>
        ));
    }
    let vacia = !filtrado;
    return (
        <tr>
            <td colSpan={columnas} className="sin-datos">
                <span className="sin-datos-icono"><Icono nombre={vacia ? 'vacio' : 'buscar'} tamano={22} /></span>
                <strong>{vacia ? (titulo || 'Aún no hay registros') : 'Sin resultados'}</strong>
                <span>{vacia ? (texto || 'Use el botón de arriba para adicionar el primero.') : 'Ningún registro coincide con la búsqueda o los filtros.'}</span>
                {vacia && accion && (
                    <button type="button" className="btn btn-primary btn-sm mt-2" onClick={accion.onClick}>
                        <Icono nombre="mas" tamano={14} /> {accion.texto}
                    </button>
                )}
            </td>
        </tr>
    );
}
