import { useEffect } from 'react';

// Mensaje de éxito o error que se oculta solo después de unos segundos
export default function Alerta({ mensaje, onCerrar }) {
    useEffect(() => {
        if (mensaje) {
            let temporizador = setTimeout(onCerrar, 4000);
            return () => clearTimeout(temporizador);
        }
    }, [mensaje]);

    if (!mensaje) {
        return null;
    }
    return (
        <div className={'alert alert-' + mensaje.tipo + ' d-flex justify-content-between'}>
            {mensaje.texto}
            <button type="button" className="btn-close" onClick={onCerrar}></button>
        </div>
    );
}
