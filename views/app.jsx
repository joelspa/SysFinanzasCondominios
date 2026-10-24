import { createRoot } from 'react-dom/client';
import Inicio from './inicio';
import ListarDepartamentos from './departamento/listar';
import NuevoDepartamento from './departamento/nuevo';
import EditarDepartamento from './departamento/editar';
import EliminarDepartamento from './departamento/eliminar';
import ListarPersonas from './persona/listar';
import NuevaPersona from './persona/nuevo';
import EditarPersona from './persona/editar';
import EliminarPersona from './persona/eliminar';
import ListarTiposDepartamento from './tipoDepartamento/listar';
import NuevoTipoDepartamento from './tipoDepartamento/nuevo';
import EditarTipoDepartamento from './tipoDepartamento/editar';
import EliminarTipoDepartamento from './tipoDepartamento/eliminar';
import ListarIngresos from './ingreso/listar';
import NuevoIngreso from './ingreso/nuevo';
import EditarIngreso from './ingreso/editar';
import EliminarIngreso from './ingreso/eliminar';
import ListarEgresos from './egreso/listar';
import NuevoEgreso from './egreso/nuevo';
import EditarEgreso from './egreso/editar';
import EliminarEgreso from './egreso/eliminar';

const pantallas = {
    departamento: { listar: ListarDepartamentos, nuevo: NuevoDepartamento, editar: EditarDepartamento, eliminar: EliminarDepartamento },
    persona: { listar: ListarPersonas, nuevo: NuevaPersona, editar: EditarPersona, eliminar: EliminarPersona },
    tipo_departamento: { listar: ListarTiposDepartamento, nuevo: NuevoTipoDepartamento, editar: EditarTipoDepartamento, eliminar: EliminarTipoDepartamento },
    ingreso: { listar: ListarIngresos, nuevo: NuevoIngreso, editar: EditarIngreso, eliminar: EliminarIngreso },
    egreso: { listar: ListarEgresos, nuevo: NuevoEgreso, editar: EditarEgreso, eliminar: EliminarEgreso }
};

// Cada enlace carga una página de Express y React muestra la vista correspondiente.
const [modulo, parametro, accion] = window.location.pathname.split('/').filter(Boolean);
let Pagina = Inicio;
let id;

if (modulo) {
    const operacion = !parametro ? 'listar' : parametro === 'nuevo' ? 'nuevo' : accion;
    Pagina = pantallas[modulo]?.[operacion];
    id = parametro;
}

createRoot(document.getElementById('root')).render(
    Pagina ? <Pagina id={id} /> : <main><h1>Página no encontrada</h1><a href="/">Volver al inicio</a></main>
);
