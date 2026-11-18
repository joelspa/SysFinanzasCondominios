import { useEffect } from 'react';
import Icono from './Icono';

const iconos = { success: 'check', danger: 'alerta', warning: 'alerta' };

// Aviso flotante de éxito o error que se oculta solo después de unos segundos.
//   mensaje: { tipo, texto, accion? }  accion: { texto, href } enlace para seguir (ej. ver el recibo)
// Con una acción el aviso dura más, para dar tiempo a usarla.
export default function Alerta({ mensaje, onCerrar }) {
    useEffect(() => {
        if (mensaje) {
            let temporizador = setTimeout(onCerrar, mensaje.accion ? 9000 : 5000);
            return () => clearTimeout(temporizador);
        }
    }, [mensaje]);

    if (!mensaje) {
        return null;
    }
    return (
        <div className={'aviso-flotante aviso-' + mensaje.tipo} role="alert">
            <Icono nombre={iconos[mensaje.tipo] || 'check'} tamano={20} className="aviso-icono" />
            <div className="flex-grow-1">
                {mensaje.texto}
                {mensaje.accion && (
                    <a className="aviso-accion" href={mensaje.accion.href}>
                        {mensaje.accion.texto} <Icono nombre="flecha" tamano={14} />
                    </a>
                )}
            </div>
            <button type="button" className="boton-icono" aria-label="Cerrar" onClick={onCerrar}>
                <Icono nombre="cerrar" tamano={16} />
            </button>
        </div>
    );
}
