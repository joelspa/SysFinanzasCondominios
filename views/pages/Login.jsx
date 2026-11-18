import { useState } from 'react';
import { enviar } from '../api';
import Icono from '../components/Icono';
import Nota from '../components/Nota';
import Campo from '../components/Campo';
import EntradaContrasena from '../components/EntradaContrasena';

// Pantalla de ingreso: es lo único que se muestra cuando no hay una sesión abierta
export default function Login() {
    const [datos, setDatos] = useState({ correo: '', contrasena: '' });
    const [error, setError] = useState('');
    const [ingresando, setIngresando] = useState(false);

    function cambiar(e) {
        setDatos({ ...datos, [e.target.name]: e.target.value });
    }

    async function ingresar(e) {
        e.preventDefault();
        setIngresando(true);
        let resultado = await enviar('/api/sesion/iniciarSesion', datos);
        if (resultado.Success) {
            window.location.href = '/';
            return;
        }
        setError(resultado.Mensaje);
        setIngresando(false);
    }

    return (
        <div className="ingreso">
            <section className="ingreso-marca">
                <span className="menu-logo"><Icono nombre="departamentos" tamano={22} /></span>
                <h1>Finanzas de Condominios</h1>
                <p>Cobros, gastos y cuentas por cobrar de cada condominio, en un solo lugar.</p>
            </section>

            <main className="ingreso-contenido">
                <form className="ingreso-formulario" onSubmit={ingresar} noValidate>
                    <h2>Ingresar al sistema</h2>
                    <p className="secundario">Use el correo y la contraseña que le dio el administrador.</p>

                    {error && <div className="mb-3"><Nota tono="critico">{error}</Nota></div>}

                    <div className="row g-3">
                        <Campo etiqueta="Correo electrónico">
                            <input name="correo" type="email" className="form-control" autoComplete="username" autoFocus
                                value={datos.correo} onChange={cambiar} />
                        </Campo>
                        <Campo etiqueta="Contraseña">
                            <EntradaContrasena name="contrasena" autoComplete="current-password"
                                valor={datos.contrasena} onChange={cambiar} />
                        </Campo>
                        <div className="col-12">
                            <button type="submit" className="btn btn-primary w-100" disabled={ingresando}>
                                {ingresando && <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>}
                                Ingresar
                            </button>
                        </div>
                    </div>
                    <p className="ingreso-pista">¿Olvidó su contraseña? Pídale al administrador que le asigne una nueva desde Usuarios.</p>
                </form>
            </main>
        </div>
    );
}
