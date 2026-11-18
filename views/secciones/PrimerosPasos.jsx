import { useState } from 'react';
import Icono from '../components/Icono';
import BarraProgreso from '../components/BarraProgreso';
import { cantidad } from '../formato';
import { recordado, recordar } from '../recordar';

// Primeros pasos para dejar un condominio listo para cobrar. Cada paso se marca solo cuando los datos
// ya existen, el siguiente pendiente se destaca y la lista desaparece cuando todo está listo.
// El usuario puede ocultarla; se recuerda para ese condominio.
//   tipos, departamentos, cargos, ingresos: datos del condominio que ya cargó el panel
export default function PrimerosPasos({ usuario, tipos, departamentos, cargos, ingresos }) {
    const oculta = 'primeros-pasos-oculto:' + usuario.id_condominio;
    const [ocultada, setOcultada] = useState(recordado(usuario.id_usuario, oculta));
    const esAdmin = usuario.rol === 'admin';

    const activos = departamentos.filter((d) => d.estado === 'activo');
    const conPropietario = activos.filter((d) => d.propietario).length;
    const pasos = [
        {
            texto: 'Definir los tipos de departamento y su cuota mensual', hecho: tipos.length > 0,
            ruta: '/configuracion#tipoDepartamento', soloAdmin: true
        },
        {
            texto: 'Registrar los departamentos', hecho: activos.length > 0, ruta: '/departamento',
            detalle: activos.length > 0 ? cantidad(activos.length, 'departamento activo', 'departamentos activos') : null
        },
        {
            texto: 'Indicar el propietario de cada departamento', hecho: activos.length > 0 && conPropietario === activos.length,
            ruta: '/residente', detalle: activos.length > 0 ? conPropietario + ' de ' + activos.length + ' tienen propietario' : null
        },
        { texto: 'Generar las primeras expensas', hecho: cargos.length > 0, ruta: '/cargo?generar=1' },
        { texto: 'Registrar el primer pago', hecho: ingresos.length > 0, ruta: '/ingreso' }
    ];
    const listos = pasos.filter((p) => p.hecho).length;
    const siguiente = pasos.find((p) => !p.hecho);

    if (ocultada || !siguiente) {
        return null;
    }

    function ocultar() {
        recordar(usuario.id_usuario, oculta);
        setOcultada(true);
    }

    return (
        <section className="panel primeros-pasos mb-4">
            <div className="panel-cabecera">
                <div>
                    <h2>Primeros pasos</h2>
                    <p>Para dejar el condominio listo para cobrar. Se marcan solos a medida que avanza.</p>
                </div>
                <button type="button" className="boton-icono" title="Ocultar" aria-label="Ocultar los primeros pasos" onClick={ocultar}>
                    <Icono nombre="cerrar" tamano={16} />
                </button>
            </div>
            <div className="panel-cuerpo">
                <div className="primeros-pasos-avance">
                    <span><b>{listos} de {pasos.length}</b> listos</span>
                    <BarraProgreso valor={listos} total={pasos.length} />
                </div>
                <ol className="primeros-pasos-lista">
                    {pasos.map((paso, i) => {
                        let esSiguiente = paso === siguiente;
                        let puedeIr = esAdmin || !paso.soloAdmin;
                        return (
                            <li key={paso.texto} className={paso.hecho ? 'hecho' : esSiguiente ? 'siguiente' : ''}>
                                <span className="primeros-pasos-marca" aria-hidden="true">
                                    {paso.hecho ? <Icono nombre="check" tamano={14} /> : i + 1}
                                </span>
                                <div className="flex-grow-1">
                                    {paso.texto}
                                    <span className="visually-hidden">{paso.hecho ? ' (listo)' : ' (pendiente)'}</span>
                                    {paso.detalle && <span className="secundario">{paso.detalle}</span>}
                                </div>
                                {!paso.hecho && (puedeIr
                                    ? <a className={'btn btn-sm ' + (esSiguiente ? 'btn-primary' : 'btn-light')} href={paso.ruta}>
                                        {esSiguiente ? 'Hacerlo ahora' : 'Ir'}
                                    </a>
                                    : <span className="secundario">Lo hace el administrador</span>)}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
