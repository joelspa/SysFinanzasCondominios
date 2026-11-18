import { createRoot } from 'react-dom/client';
import { obtener } from './api';
import { RUTAS_ADMIN } from './opciones';
import Menu from './components/Menu';
import Guia from './components/Guia';
import Login from './pages/Login';
import CentroAyuda from './pages/CentroAyuda';
import Inicio from './pages/Inicio';
import Condominios from './pages/Condominios';
import Personas from './pages/Personas';
import Departamentos from './pages/Departamentos';
import FichaDepartamento from './pages/FichaDepartamento';
import Residentes from './pages/Residentes';
import Cargos from './pages/Cargos';
import Ingresos from './pages/Ingresos';
import Comprobante from './pages/Comprobante';
import Egresos from './pages/Egresos';
import ComprobanteEgreso from './pages/ComprobanteEgreso';
import Caja from './pages/Caja';
import ReporteMensual from './pages/ReporteMensual';
import AvisosCobranza from './pages/AvisosCobranza';
import Configuracion from './pages/Configuracion';
import Usuarios from './pages/Usuarios';

// Express entrega esta misma app en cada ruta (routers/indexRouter.js); aquí se elige qué página mostrar
const paginas = {
    '/': Inicio,
    '/condominio': Condominios,
    '/ayuda': CentroAyuda,
    '/persona': Personas,
    '/departamento': Departamentos,
    '/departamento/ficha': FichaDepartamento,
    '/residente': Residentes,
    '/cargo': Cargos,
    '/cargo/avisos': AvisosCobranza,
    '/reporte': ReporteMensual,
    '/ingreso': Ingresos,
    '/ingreso/comprobante': Comprobante,
    '/egreso': Egresos,
    '/egreso/comprobante': ComprobanteEgreso,
    '/caja': Caja,
    '/configuracion': Configuracion,
    '/usuario': Usuarios
};

const ruta = window.location.pathname.replace(/\/$/, '') || '/';
const raiz = createRoot(document.getElementById('root'));

// Antes de dibujar se pregunta al servidor quién ingresó. Sin sesión solo se muestra la pantalla de ingreso
// (api.js ya llevó el navegador a /login si estaba en otra página).
async function iniciar() {
    let sesion = await obtener('/api/sesion/obtenerSesion');
    if (!sesion.Success) {
        raiz.render(<Login />);
        return;
    }
    if (ruta === '/login') {
        window.location.replace('/');
        return;
    }

    // usuario: { nombre, correo, rol, condominios: los que puede usar, id_condominio: en el que está trabajando }
    let usuario = sesion.Data;
    let permitida = usuario.rol === 'admin' || !RUTAS_ADMIN.includes(ruta);
    // Una dirección desconocida o sin permiso muestra el panel principal (y su menú y su guía)
    let mostrada = permitida && paginas[ruta] ? ruta : '/';
    let Pagina = paginas[mostrada];

    raiz.render(
        <div className="app">
            <Menu ruta={mostrada} usuario={usuario} />
            <main className="app-principal">
                <Pagina usuario={usuario} />
            </main>
            <Guia ruta={mostrada} usuario={usuario} />
        </div>
    );
}

iniciar();
