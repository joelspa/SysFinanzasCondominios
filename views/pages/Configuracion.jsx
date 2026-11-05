import { useState } from 'react';
import Encabezado from '../components/Encabezado';
import Pestanas from '../components/Pestanas';
import DatosCondominio from '../secciones/DatosCondominio';
import CatalogoTipos from '../secciones/CatalogoTipos';

const PESTANAS = [
    { clave: 'condominio', texto: 'Datos del condominio' },
    { clave: 'tipoDepartamento', texto: 'Tipos de departamento' },
    { clave: 'tipoIngreso', texto: 'Tipos de ingreso' },
    { clave: 'tipoEgreso', texto: 'Tipos de gasto' }
];

// La pestaña se guarda en la dirección (#tipoDepartamento) para poder enlazarla desde otras páginas
function pestanaInicial() {
    let clave = window.location.hash.slice(1);
    return PESTANAS.some((p) => p.clave === clave) ? clave : 'condominio';
}

export default function Configuracion() {
    const [pestana, setPestana] = useState(pestanaInicial);

    function cambiarPestana(clave) {
        setPestana(clave);
        window.history.replaceState(null, '', '#' + clave);
    }

    return (
        <>
            <Encabezado titulo="Configuración"
                descripcion="Datos del condominio y listas que se usan en los formularios del sistema." />
            <Pestanas pestanas={PESTANAS} activa={pestana} onCambiar={cambiarPestana} />

            {pestana === 'condominio' && <DatosCondominio />}
            {pestana === 'tipoDepartamento' && (
                <CatalogoTipos catalogo="tipoDepartamento" id="id_tipo_departamento" singular="tipo de departamento"
                    titulo="Tipos de departamento" usadoPor={['departamento', 'departamentos']} maxNombre="60" conCuota
                    ayuda="Cada tipo define la cuota mensual (expensa) de sus departamentos." />
            )}
            {pestana === 'tipoIngreso' && (
                <CatalogoTipos catalogo="tipoIngreso" id="id_tipo_ingreso" singular="tipo de ingreso"
                    titulo="Tipos de ingreso" usadoPor={['pago', 'pagos']} maxNombre="100"
                    ayuda="Clasifican los pagos recibidos: expensas, multas, alquiler de áreas comunes, etc." />
            )}
            {pestana === 'tipoEgreso' && (
                <CatalogoTipos catalogo="tipoEgreso" id="id_tipo_egreso" singular="tipo de gasto"
                    titulo="Tipos de gasto" usadoPor={['gasto', 'gastos']} maxNombre="100"
                    ayuda="Clasifican los gastos del condominio: servicios, sueldos, mantenimiento, etc." />
            )}
        </>
    );
}
