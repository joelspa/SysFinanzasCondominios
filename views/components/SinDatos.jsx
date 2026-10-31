import Icono from './Icono';

// Fila que se muestra cuando la tabla no tiene registros (o mientras se cargan)
export default function SinDatos({ columnas, cargando, filtrado }) {
    let titulo = 'Aún no hay registros';
    let texto = 'Use el botón de arriba para adicionar el primero.';
    if (cargando) {
        titulo = 'Cargando...';
        texto = '';
    } else if (filtrado) {
        titulo = 'Sin resultados';
        texto = 'Ningún registro coincide con la búsqueda o los filtros.';
    }
    return (
        <tr>
            <td colSpan={columnas} className="sin-datos">
                {cargando
                    ? <span className="spinner-border spinner-border-sm text-secondary mb-2" aria-hidden="true"></span>
                    : <span className="sin-datos-icono"><Icono nombre="vacio" tamano={22} /></span>}
                <strong>{titulo}</strong>
                {texto && <span>{texto}</span>}
            </td>
        </tr>
    );
}
