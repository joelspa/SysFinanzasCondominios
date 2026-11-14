import Opciones from './Opciones';

// Lista desplegable para filtrar la tabla; el valor '' significa "todos"
export default function Filtro({ etiqueta, todos, opciones, valor, onCambiar }) {
    return (
        <select className="form-select" aria-label={etiqueta} value={valor} onChange={(e) => onCambiar(e.target.value)}>
            <option value="">{todos}</option>
            <Opciones lista={opciones} />
        </select>
    );
}
