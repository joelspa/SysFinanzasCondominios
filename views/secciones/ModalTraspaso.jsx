import { useState } from 'react';
import Modal from '../components/Modal';
import Campo from '../components/Campo';
import Opciones from '../components/Opciones';
import Nota from '../components/Nota';
import Casilla from '../components/Casilla';
import { dinero, hoy } from '../formato';

// Traspaso de propiedad: cierra al propietario actual y registra al nuevo.
// Si el departamento tiene deuda se advierte y hay que confirmarlo (queda registrada en el historial).
//   idDepartamento: departamento elegido al abrir (opcional)
//   onConfirmar(datos) devuelve un mensaje de error o null si salió bien
export default function ModalTraspaso({ departamentos, personas, idDepartamento, onCerrar, onConfirmar }) {
    const [datos, setDatos] = useState({
        id_departamento: idDepartamento || (departamentos.length > 0 ? departamentos[0].id_departamento : ''),
        id_propietario_nuevo: '', fecha: hoy(), observacion: '', confirmar_deuda: false
    });

    const departamento = departamentos.find((d) => d.id_departamento == datos.id_departamento);
    const deuda = Number(departamento ? departamento.deuda : 0);
    const candidatos = personas.filter((p) => !departamento || p.id_persona != departamento.id_propietario);

    function cambiar(e) {
        let cambios = { [e.target.name]: e.target.value };
        if (e.target.name === 'id_departamento') {
            cambios.confirmar_deuda = false;
        }
        setDatos({ ...datos, ...cambios });
    }

    return (
        <Modal titulo="Traspaso de propiedad" textoAceptar="Registrar traspaso"
            descripcion="El propietario actual quedará en el historial con su fecha de salida."
            deshabilitado={!datos.id_propietario_nuevo || (deuda > 0 && !datos.confirmar_deuda)}
            onCerrar={onCerrar} onAceptar={() => onConfirmar(datos)}>
            <div className="row g-3">
                <Campo etiqueta="Departamento" requerido ancho="col-md-6">
                    <select name="id_departamento" className="form-select" value={datos.id_departamento} onChange={cambiar}>
                        <Opciones lista={departamentos} valor="id_departamento" texto="numero" />
                    </select>
                </Campo>
                <Campo etiqueta="Fecha del traspaso" requerido ancho="col-md-6">
                    <input name="fecha" type="date" className="form-control" value={datos.fecha} onChange={cambiar} />
                </Campo>

                <div className="col-12">
                    <div className="traspaso-flujo">
                        <div>
                            <span className="secundario">Propietario actual</span>
                            <strong>{departamento && departamento.propietario ? departamento.propietario : 'Sin propietario'}</strong>
                        </div>
                        <span className="traspaso-flecha" aria-hidden="true">→</span>
                        <div className="flex-grow-1">
                            <label className="form-label requerido mb-1" htmlFor="nuevo-propietario">Nuevo propietario</label>
                            <select id="nuevo-propietario" name="id_propietario_nuevo" className="form-select"
                                value={datos.id_propietario_nuevo} onChange={cambiar}>
                                <option value="">Seleccione una persona</option>
                                <Opciones lista={candidatos} valor="id_persona" texto="nombre" />
                            </select>
                        </div>
                    </div>
                    <div className="form-text">Si la persona no aparece, regístrela primero en Personas.</div>
                </div>

                {deuda > 0 ? (
                    <div className="col-12">
                        <Nota tono="aviso" titulo={'El departamento tiene una deuda de ' + dinero(deuda)}>
                            La deuda queda registrada a nombre del propietario anterior y sigue perteneciendo
                            al departamento hasta que se pague.
                        </Nota>
                        <Casilla etiqueta="Entiendo y deseo registrar el traspaso con deuda pendiente"
                            marcado={datos.confirmar_deuda} onCambiar={(valor) => setDatos({ ...datos, confirmar_deuda: valor })} />
                    </div>
                ) : (
                    <div className="col-12">
                        <Nota tono="bueno">El departamento no tiene deudas pendientes.</Nota>
                    </div>
                )}

                <Campo etiqueta="Observación">
                    <textarea name="observacion" className="form-control" rows="2" maxLength="250"
                        placeholder="Ej. Compraventa según minuta notarial Nº 123" value={datos.observacion} onChange={cambiar} />
                </Campo>
            </div>
        </Modal>
    );
}
