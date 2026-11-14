import { useState } from 'react';
import Icono from './Icono';

// Campo de contraseña con botón para mostrarla u ocultarla.
// Recibe el id de <Campo> (ver aceptaId) para que la etiqueta quede unida al campo.
export default function EntradaContrasena({ id, name, valor, onChange, placeholder }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="entrada-contrasena">
            <input id={id} name={name} type={visible ? 'text' : 'password'} className="form-control" autoComplete="new-password"
                placeholder={placeholder} value={valor} onChange={onChange} />
            <button type="button" className="boton-icono" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={visible ? 'Ocultar' : 'Mostrar'} onClick={() => setVisible(!visible)}>
                <Icono nombre={visible ? 'ojo-cerrado' : 'ojo'} tamano={17} />
            </button>
        </div>
    );
}

EntradaContrasena.aceptaId = true;
