import Icono from './Icono';

// Botones de editar y eliminar de cada fila de la tabla
export default function Acciones({ onEditar, onEliminar }) {
    return (
        <td className="text-end text-nowrap">
            <button type="button" className="boton-icono" title="Editar" aria-label="Editar" onClick={onEditar}>
                <Icono nombre="editar" tamano={17} />
            </button>
            <button type="button" className="boton-icono peligro" title="Eliminar" aria-label="Eliminar" onClick={onEliminar}>
                <Icono nombre="eliminar" tamano={17} />
            </button>
        </td>
    );
}
