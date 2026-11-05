import { useState } from 'react';
import Modal from '../components/Modal';
import Campo from '../components/Campo';

// Anulación de un movimiento (pago o gasto): no se borra, queda en el historial con su motivo.
//   children: resumen del movimiento que se anula
//   onConfirmar(motivo) devuelve un mensaje de error o null si salió bien
export default function ModalAnular({ titulo, descripcion, placeholder, onCerrar, onConfirmar, children }) {
    const [motivo, setMotivo] = useState('');
    return (
        <Modal titulo={titulo} textoAceptar={titulo} colorAceptar="danger" descripcion={descripcion}
            deshabilitado={motivo.trim() === ''} onCerrar={onCerrar} onAceptar={() => onConfirmar(motivo)}>
            <p>{children}</p>
            <div className="row">
                <Campo etiqueta="Motivo de la anulación" requerido>
                    <textarea className="form-control" rows="2" maxLength="200" autoFocus placeholder={placeholder}
                        value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                </Campo>
            </div>
        </Modal>
    );
}
