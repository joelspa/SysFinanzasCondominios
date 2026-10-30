// Ventana modal con botones Cancelar y Aceptar
export default function Modal({ titulo, error, textoAceptar = 'Guardar', colorAceptar = 'primary', onCerrar, onAceptar, children }) {
    return (
        <>
            <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{titulo}</h5>
                            <button type="button" className="btn-close" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            {children}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
                            <button className={'btn btn-' + colorAceptar} onClick={onAceptar}>{textoAceptar}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop show"></div>
        </>
    );
}
