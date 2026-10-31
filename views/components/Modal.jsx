import { useState, useEffect } from 'react';
import Icono from './Icono';

// Ventana modal con botones Cancelar y Aceptar. Enter acepta y Escape cierra.
export default function Modal({ titulo, descripcion, error, textoAceptar = 'Guardar', colorAceptar = 'primary', onCerrar, onAceptar, children }) {
    const [ocupado, setOcupado] = useState(false);

    useEffect(() => {
        function tecla(e) {
            if (e.key === 'Escape') {
                onCerrar();
            }
        }
        document.addEventListener('keydown', tecla);
        document.body.classList.add('modal-open');
        return () => {
            document.removeEventListener('keydown', tecla);
            document.body.classList.remove('modal-open');
        };
    }, [onCerrar]);

    // Evita que se envíe dos veces si el usuario hace doble clic
    async function aceptar(e) {
        e.preventDefault();
        if (ocupado) {
            return;
        }
        setOcupado(true);
        try {
            await onAceptar();
        } finally {
            setOcupado(false);
        }
    }

    return (
        <>
            <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered">
                    <form className="modal-content" onSubmit={aceptar} noValidate>
                        <div className="modal-header">
                            <div>
                                <h5 className="modal-title">{titulo}</h5>
                                {descripcion && <p className="modal-descripcion">{descripcion}</p>}
                            </div>
                            <button type="button" className="boton-icono" aria-label="Cerrar" onClick={onCerrar}>
                                <Icono nombre="cerrar" />
                            </button>
                        </div>
                        <div className="modal-body">
                            {error && (
                                <div className="modal-error">
                                    <Icono nombre="alerta" tamano={18} />
                                    {error}
                                </div>
                            )}
                            {children}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onCerrar}>Cancelar</button>
                            <button type="submit" className={'btn btn-' + colorAceptar} disabled={ocupado}>
                                {ocupado && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                                {textoAceptar}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="modal-backdrop show"></div>
        </>
    );
}
