import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import { coincide, dinero } from '../formato';
import Alerta from '../components/Alerta';
import PanelTabla from '../components/PanelTabla';
import Buscador from '../components/Buscador';
import SinDatos from '../components/SinDatos';
import Acciones from '../components/Acciones';
import Modal from '../components/Modal';
import ConfirmarEliminar from '../components/ConfirmarEliminar';
import Campo from '../components/Campo';
import Nota from '../components/Nota';
import Icono from '../components/Icono';

// Tabla y formulario de un catálogo de tipos (de departamento, de ingreso o de gasto).
//   catalogo:   nombre en la API ('tipoDepartamento' | 'tipoIngreso' | 'tipoEgreso')
//   id:         campo clave del tipo
//   titulo, ayuda: encabezado de la sección
//   singular:   cómo se nombra un tipo ('tipo de gasto')
//   usadoPor:   qué registros usan el tipo, [singular, plural] (['gasto', 'gastos'])
//   maxNombre:  largo máximo del nombre (según la tabla)
//   conCuota:   muestra la cuota mensual (solo tipos de departamento)
export default function CatalogoTipos({ catalogo, id, titulo, ayuda, singular, usadoPor, maxNombre, conCuota }) {
    const base = '/api/catalogo/' + catalogo;
    const crud = useCrud({
        rutas: { obtener: base + '/obtener', guardar: base + '/guardar', eliminar: base + '/eliminar' },
        id, nombre: 'El ' + singular, inicial: []
    });
    const [busqueda, setBusqueda] = useState('');

    const tipos = crud.datos;
    const formulario = crud.formulario;
    const original = formulario ? tipos.find((t) => t[id] == formulario[id]) : null;
    const cambioCuota = conCuota && original && Number(formulario.cuota_mensual) !== Number(original.cuota_mensual);
    const filtrados = tipos.filter((t) => coincide(busqueda, t.nombre, t.descripcion));

    function adicionar() {
        crud.abrirFormulario({ [id]: 0, nombre: '', descripcion: '', ...(conCuota ? { cuota_mensual: '' } : {}) });
    }

    return (
        <>
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <div className="seccion-cabecera">
                <div>
                    <h2>{titulo}</h2>
                    <p>{ayuda}</p>
                </div>
                <button className="btn btn-primary" onClick={adicionar}>
                    <Icono nombre="mas" tamano={16} /> Nuevo {singular}
                </button>
            </div>

            <PanelTabla mostrados={filtrados.length} total={tipos.length}
                herramientas={<Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por nombre o descripción" />}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        {conCuota && <th className="text-end">Cuota mensual</th>}
                        <th className="text-end">En uso</th>
                        <th className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={conCuota ? 5 : 4} cargando={crud.cargando} filtrado={tipos.length > 0} />}
                    {filtrados.map((tipo) => (
                        <tr key={tipo[id]}>
                            <td><strong>{tipo.nombre}</strong></td>
                            <td>{tipo.descripcion || <span className="text-body-tertiary">—</span>}</td>
                            {conCuota && <td className="text-end numero fw-semibold">{dinero(tipo.cuota_mensual)}</td>}
                            <td className="text-end text-nowrap">
                                {tipo.uso > 0 ? tipo.uso + ' ' + (tipo.uso === 1 ? usadoPor[0] : usadoPor[1]) : <span className="text-body-tertiary">Sin uso</span>}
                            </td>
                            {/* Un tipo en uso no se puede eliminar: solo se ofrece editar */}
                            <Acciones onEditar={() => crud.abrirFormulario(tipo)}
                                onEliminar={tipo.uso === 0 ? () => crud.confirmarEliminar(tipo) : undefined} />
                        </tr>
                    ))}
                </tbody>
            </PanelTabla>

            {formulario && (
                <Modal titulo={(formulario[id] == 0 ? 'Nuevo ' : 'Editar ') + singular}
                    error={crud.error} onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Nombre" requerido ancho={conCuota ? 'col-md-7' : 'col-12'}>
                            <input name="nombre" className="form-control" maxLength={maxNombre} autoFocus
                                value={formulario.nombre} onChange={crud.cambiar} />
                        </Campo>
                        {conCuota && (
                            <Campo etiqueta="Cuota mensual (Bs)" requerido ancho="col-md-5">
                                <input name="cuota_mensual" type="number" step="0.01" min="0" className="form-control" placeholder="0.00"
                                    value={formulario.cuota_mensual} onChange={crud.cambiar} />
                            </Campo>
                        )}
                        <Campo etiqueta="Descripción">
                            <input name="descripcion" className="form-control" maxLength="200"
                                value={formulario.descripcion} onChange={crud.cambiar} />
                        </Campo>
                        {cambioCuota && (
                            <div className="col-12">
                                <Nota tono="info" titulo="La nueva cuota rige para las próximas expensas">
                                    Se aplicará a los {original.uso} departamentos de este tipo desde la próxima emisión.
                                    Las expensas ya emitidas conservan su monto.
                                </Nota>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {crud.aEliminar && (
                <ConfirmarEliminar titulo={'Eliminar ' + singular} onCerrar={crud.cancelarEliminar} onAceptar={crud.eliminar}>
                    ¿Está seguro que desea eliminar <b>{crud.aEliminar.nombre}</b>?
                </ConfirmarEliminar>
            )}
        </>
    );
}
