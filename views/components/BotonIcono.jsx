import Icono from './Icono';

// Botón de solo ícono (con su texto en el tooltip). Con href se comporta como enlace.
export default function BotonIcono({ icono, titulo, onClick, href, peligro }) {
    let clase = 'boton-icono' + (peligro ? ' peligro' : '');
    if (href) {
        return (
            <a className={clase} href={href} title={titulo} aria-label={titulo}>
                <Icono nombre={icono} tamano={17} />
            </a>
        );
    }
    return (
        <button type="button" className={clase} title={titulo} aria-label={titulo} onClick={onClick}>
            <Icono nombre={icono} tamano={17} />
        </button>
    );
}
