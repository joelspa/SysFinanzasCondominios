import { useState, useId } from 'react';
import Icono from './Icono';
import { GLOSARIO } from '../glosario';

// Botón «?» que explica un término al pasar el mouse, al tocarlo o al llegar con el teclado.
// Se cierra al quitar el mouse, al tocar en otro lugar o con Escape. (El clic solo abre: el foco que
// recibe el botón con ese mismo clic ya lo abrió, y alternar lo volvería a cerrar.)
//   termino: clave de GLOSARIO (views/glosario.js)
export default function Ayuda({ termino }) {
    const [abierta, setAbierta] = useState(false);
    const id = useId();
    const { termino: nombre, texto } = GLOSARIO[termino];

    return (
        <span className="ayuda" onMouseEnter={() => setAbierta(true)} onMouseLeave={() => setAbierta(false)}>
            <button type="button" className="ayuda-boton" aria-label={'Qué significa «' + nombre + '»'}
                aria-describedby={abierta ? id : undefined} aria-expanded={abierta}
                onClick={() => setAbierta(true)} onFocus={() => setAbierta(true)} onBlur={() => setAbierta(false)}
                onKeyDown={(e) => e.key === 'Escape' && setAbierta(false)}>
                <Icono nombre="ayuda" tamano={14} />
            </button>
            {abierta && (
                <span role="tooltip" id={id} className="ayuda-globo">
                    <strong>{nombre}</strong>
                    {texto}
                </span>
            )}
        </span>
    );
}
