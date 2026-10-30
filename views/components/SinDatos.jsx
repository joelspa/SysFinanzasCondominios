// Fila que se muestra cuando la tabla no tiene registros
export default function SinDatos({ columnas }) {
    return (
        <tr>
            <td colSpan={columnas} className="text-center text-muted py-4">No hay registros</td>
        </tr>
    );
}
