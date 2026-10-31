import Icono from './Icono';

// Caja de búsqueda de las tablas
export default function Buscador({ valor, onCambiar, placeholder = 'Buscar...' }) {
    return (
        <div className="buscador">
            <Icono nombre="buscar" tamano={16} />
            <input type="search" className="form-control" placeholder={placeholder} aria-label={placeholder}
                value={valor} onChange={(e) => onCambiar(e.target.value)} />
        </div>
    );
}
