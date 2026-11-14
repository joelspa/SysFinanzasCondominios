import { useId, cloneElement } from 'react';

const CONTROLES = ['input', 'select', 'textarea'];

// Campo del formulario: etiqueta + control dentro de su columna.
// Si el control es un input, select o textarea (o un componente marcado con aceptaId, como EntradaContrasena),
// la etiqueta queda unida a él (al hacer clic se enfoca).
//   ayuda: texto corto debajo del control
export default function Campo({ etiqueta, requerido, ancho = 'col-12', ayuda, children }) {
    const id = useId();
    let esControl = CONTROLES.includes(children.type) || children.type.aceptaId === true;
    return (
        <div className={ancho}>
            <label htmlFor={esControl ? id : undefined} className={'form-label' + (requerido ? ' requerido' : '')}>{etiqueta}</label>
            {esControl ? cloneElement(children, { id }) : children}
            {ayuda && <div className="form-text">{ayuda}</div>}
        </div>
    );
}
