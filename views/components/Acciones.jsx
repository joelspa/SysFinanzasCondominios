// Botones de editar y eliminar de cada fila de la tabla
export default function Acciones({ onEditar, onEliminar }) {
    return (
        <td className="text-center text-nowrap">
            <button className="btn btn-sm btn-outline-primary me-1" title="Editar" onClick={onEditar}>
                <img src="/public/icons/pencil.svg" alt="Editar" />
            </button>
            <button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={onEliminar}>
                <img src="/public/icons/trash.svg" alt="Eliminar" />
            </button>
        </td>
    );
}
