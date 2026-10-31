import { createRoot } from 'react-dom/client';
import Menu from './components/Menu';
import Inicio from './pages/Inicio';
import Personas from './pages/Personas';
import Departamentos from './pages/Departamentos';
import Residentes from './pages/Residentes';
import Ingresos from './pages/Ingresos';

// Express entrega esta misma app en cada ruta; aquí se elige qué página mostrar
const paginas = {
    '/': Inicio,
    '/persona': Personas,
    '/departamento': Departamentos,
    '/residente': Residentes,
    '/ingreso': Ingresos
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
