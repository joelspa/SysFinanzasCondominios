import { useEffect } from 'react';
import Icono from './Icono';

const iconos = { success: 'check', danger: 'alerta', warning: 'alerta' };

// Aviso flotante de éxito o error que se oculta solo después de unos segundos
export default function Alerta({ mensaje, onCerrar }) {
    useEffect(() => {
        if (mensaje) {
            let temporizador = setTimeout(onCerrar, 5000);
            return () => clearTimeout(temporizador);
        }
    }, [mensaje]);

    if (!mensaje) {
        return null;
    }
    return (
        <div className={'aviso-flotante aviso-' + mensaje.tipo} role="alert">
            <Icono nombre={iconos[mensaje.tipo] || 'check'} tamano={20} className="aviso-icono" />
            <div className="flex-grow-1">{mensaje.texto}</div>
            <button type="button" className="boton-icono" aria-label="Cerrar" onClick={onCerrar}>
                <Icono nombre="cerrar" tamano={16} />
            </button>
        </div>
    );
}
