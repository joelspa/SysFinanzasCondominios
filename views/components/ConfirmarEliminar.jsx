import Modal from './Modal';

// Ventana para confirmar que se quiere eliminar un registro
export default function ConfirmarEliminar({ titulo, onCerrar, onAceptar, children }) {
    return (
        <Modal titulo={titulo} textoAceptar="Sí, eliminar" colorAceptar="danger" onCerrar={onCerrar} onAceptar={onAceptar}>
            {children}
        </Modal>
    );
}
