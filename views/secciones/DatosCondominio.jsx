import { useState, useEffect } from 'react';
import useCrud from '../hooks/useCrud';
import { contactoCondominio } from '../formato';
import Alerta from '../components/Alerta';
import Cargando from '../components/Cargando';
import Campo from '../components/Campo';
import Nota from '../components/Nota';
import Icono from '../components/Icono';

// Datos generales del condominio en el que se está trabajando: salen en los comprobantes y definen
// el vencimiento de las expensas. Es un formulario fijo en la página (no un modal): siempre edita ese condominio.
export default function DatosCondominio() {
    const crud = useCrud({
        rutas: { obtener: '/api/condominio/obtenerCondominio', guardar: '/api/condominio/guardarCondominio' },
        id: 'id_condominio', nombre: 'La información del condominio', inicial: null
    });
    const [guardando, setGuardando] = useState(false);

    // Cada vez que llegan los datos (al entrar y después de guardar) se cargan en el formulario
    useEffect(() => {
        if (crud.datos) {
            crud.abrirFormulario(crud.datos);
        }
    }, [crud.datos]);

    async function guardar(e) {
        e.preventDefault();
        setGuardando(true);
        await crud.guardar();
        setGuardando(false);
    }

    const formulario = crud.formulario;
    if (!formulario) {
        return <Cargando />;
    }

    return (
        <>
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />
            <div className="row g-4">
                <div className="col-lg-8">
                    <form className="panel" onSubmit={guardar} noValidate>
                        <div className="panel-cabecera">
                            <div>
                                <h2>Datos del condominio</h2>
                                <p>Aparecen en el encabezado de los comprobantes de pago y de egreso.</p>
                            </div>
                        </div>
                        <div className="panel-cuerpo">
                            {crud.error && <div className="mb-3"><Nota tono="critico">{crud.error}</Nota></div>}
                            <div className="row g-3">
                                <Campo etiqueta="Nombre del condominio" requerido>
                                    <input name="nombre" className="form-control" maxLength="120" placeholder="Ej. Condominio Los Jardines"
                                        value={formulario.nombre} onChange={crud.cambiar} />
                                </Campo>
                                <Campo etiqueta="Dirección" requerido>
                                    <input name="direccion" className="form-control" maxLength="200"
                                        value={formulario.direccion} onChange={crud.cambiar} />
                                </Campo>
                                <Campo etiqueta="NIT" ancho="col-md-4">
                                    <input name="nit" className="form-control" maxLength="30"
                                        value={formulario.nit} onChange={crud.cambiar} />
                                </Campo>
                                <Campo etiqueta="Teléfono" ancho="col-md-4">
                                    <input name="telefono" className="form-control" maxLength="30"
                                        value={formulario.telefono} onChange={crud.cambiar} />
                                </Campo>
                                <Campo etiqueta="Correo electrónico" ancho="col-md-4">
                                    <input name="correo" type="email" className="form-control" maxLength="120"
                                        value={formulario.correo} onChange={crud.cambiar} />
                                </Campo>
                                <Campo etiqueta="Día de vencimiento de las expensas" requerido ancho="col-md-6"
                                    ayuda="Entre 1 y 28. Se usa al emitir expensas y al cobrar meses adelantados.">
                                    <input name="dia_vencimiento" type="number" min="1" max="28" className="form-control"
                                        value={formulario.dia_vencimiento} onChange={crud.cambiar} />
                                </Campo>
                            </div>
                        </div>
                        <div className="panel-acciones">
                            <button type="submit" className="btn btn-primary" disabled={guardando}>
                                {guardando && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>

                <div className="col-lg-4">
                    <section className="panel">
                        <div className="panel-cabecera">
                            <div><h2>Vista previa</h2><p>Así se verá el encabezado de los comprobantes</p></div>
                        </div>
                        <div className="panel-cuerpo">
                            <div className="membrete">
                                <span className="menu-logo"><Icono nombre="departamentos" tamano={20} /></span>
                                <div>
                                    <strong className="d-block">{formulario.nombre || 'Nombre del condominio'}</strong>
                                    <span className="secundario">{formulario.direccion || 'Dirección'}</span>
                                    <span className="secundario">{contactoCondominio(formulario)}</span>
                                </div>
                            </div>
                            <p className="secundario mt-3 mb-0">
                                Las expensas vencen el día <b>{formulario.dia_vencimiento || '—'}</b> de cada mes.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
