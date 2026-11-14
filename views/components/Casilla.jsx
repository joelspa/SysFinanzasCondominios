import { useId } from 'react';

// Interruptor de sí/no con su explicación
export default function Casilla({ etiqueta, descripcion, marcado, onCambiar }) {
    const id = useId();
    return (
        <div className="form-check form-switch casilla">
            <input className="form-check-input" type="checkbox" role="switch" id={id}
                checked={!!marcado} onChange={(e) => onCambiar(e.target.checked)} />
            <label className="form-check-label" htmlFor={id}>
                {etiqueta}
                {descripcion && <span className="secundario">{descripcion}</span>}
            </label>
        </div>
    );
}
