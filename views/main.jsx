import { createRoot } from 'react-dom/client';
import Menu from './components/Menu';
import Inicio from './pages/Inicio';
import Personas from './pages/Personas';
import Departamentos from './pages/Departamentos';
import FichaDepartamento from './pages/FichaDepartamento';
import Residentes from './pages/Residentes';
import Cargos from './pages/Cargos';
import Ingresos from './pages/Ingresos';
import Comprobante from './pages/Comprobante';
import Egresos from './pages/Egresos';
import ComprobanteEgreso from './pages/ComprobanteEgreso';
import Configuracion from './pages/Configuracion';
import Usuarios from './pages/Usuarios';

// Express entrega esta misma app en cada ruta (routers/indexRouter.js); aquí se elige qué página mostrar
const paginas = {
    '/': Inicio,
    '/persona': Personas,
    '/departamento': Departamentos,
    '/departamento/ficha': FichaDepartamento,
    '/residente': Residentes,
    '/cargo': Cargos,
    '/ingreso': Ingresos,
    '/ingreso/comprobante': Comprobante,
    '/egreso': Egresos,
    '/egreso/comprobante': ComprobanteEgreso,
    '/configuracion': Configuracion,
    '/usuario': Usuarios
};

const ruta = window.location.pathname.replace(/\/$/, '') || '/';
const Pagina = paginas[ruta] || Inicio;

createRoot(document.getElementById('root')).render(
    <div className="app">
        <Menu ruta={ruta} />
        <main className="app-principal">
            <Pagina />
        </main>
    </div>
);
