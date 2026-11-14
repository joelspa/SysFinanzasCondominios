import { useState } from 'react';
import { enviar } from '../api';
import Modal from '../components/Modal';
import Campo from '../components/Campo';
import EntradaContrasena from '../components/EntradaContrasena';
import { LARGO_MINIMO_CONTRASENA } from '../opciones';

// El usuario que ingresó cambia su propia contraseña (tiene que escribir la actual).
//   onCambiada(): se llama cuando el cambio se guardó
export default function ModalContrasena({ onCerrar, onCambiada }) {
    const [datos, setDatos] = useState({ actual: '', nueva: '', confirmacion: '' });

    function cambiar(e) {
        setDatos({ ...datos, [e.target.name]: e.target.value });
    }

    // Devuelve el mensaje de error para que Modal lo muestre, o nada si salió bien
    async function guardar() {
        if (datos.nueva.length < LARGO_MINIMO_CONTRASENA) {
            return 'La contraseña nueva debe tener al menos ' + LARGO_MINIMO_CONTRASENA + ' caracteres';
        }
        if (datos.nueva !== datos.confirmacion) {
            return 'La contraseña nueva y su repetición no coinciden';
        }
        let resultado = await enviar('/api/sesion/cambiarContrasena', { actual: datos.actual, nueva: datos.nueva });
        if (!resultado.Success) {
            return resultado.Mensaje;
        }
        onCambiada();
    }

    return (
        <Modal titulo="Cambiar mi contraseña" textoAceptar="Cambiar contraseña"
            deshabilitado={!datos.actual || !datos.nueva || !datos.confirmacion}
            onCerrar={onCerrar} onAceptar={guardar}>
            <div className="row g-3">
                <Campo etiqueta="Contraseña actual" requerido>
                    <EntradaContrasena name="actual" autoComplete="current-password" valor={datos.actual} onChange={cambiar} />
                </Campo>
                <Campo etiqueta="Contraseña nueva" requerido ancho="col-md-6" ayuda={'Mínimo ' + LARGO_MINIMO_CONTRASENA + ' caracteres.'}>
                    <EntradaContrasena name="nueva" valor={datos.nueva} onChange={cambiar} />
                </Campo>
                <Campo etiqueta="Repetir contraseña nueva" requerido ancho="col-md-6">
                    <EntradaContrasena name="confirmacion" valor={datos.confirmacion} onChange={cambiar} />
                </Campo>
            </div>
        </Modal>
    );
}
