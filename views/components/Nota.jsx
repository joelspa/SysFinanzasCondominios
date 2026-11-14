import Icono from './Icono';

const iconos = { info: 'info', aviso: 'alerta', critico: 'alerta', bueno: 'check' };

// Mensaje dentro de la página o de un formulario (información, advertencia o error)
export default function Nota({ tono = 'info', titulo, children }) {
    return (
        <div className={'nota nota-' + tono} role={tono === 'critico' ? 'alert' : undefined}>
            <Icono nombre={iconos[tono]} tamano={18} className="nota-icono" />
            <div>
                {titulo && <strong className="d-block">{titulo}</strong>}
                {children}
            </div>
        </div>
    );
}
