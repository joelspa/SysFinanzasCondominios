import BotonIcono from './BotonIcono';

// Celda con los botones de cada fila de la tabla.
// children: botones adicionales (ej. ver ficha) que van antes de editar y eliminar
export default function Acciones({ onEditar, onEliminar, tituloEliminar = 'Eliminar', iconoEliminar = 'eliminar', children }) {
    return (
        <td className="text-end text-nowrap columna-acciones">
            {children}
            {onEditar && <BotonIcono icono="editar" titulo="Editar" onClick={onEditar} />}
            {onEliminar && <BotonIcono icono={iconoEliminar} titulo={tituloEliminar} peligro onClick={onEliminar} />}
        </td>
    );
}
