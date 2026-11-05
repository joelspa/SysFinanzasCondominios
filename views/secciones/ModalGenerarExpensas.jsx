import { useState } from 'react';
import Modal from '../components/Modal';
import Campo from '../components/Campo';
import Nota from '../components/Nota';
import { dinero, hoy, mesLargo } from '../formato';

// Emite la expensa del mes a todos los departamentos activos (no duplica las que ya existen).
//   diaVencimiento: día configurado en el condominio (se puede cambiar solo para esta emisión)
//   onConfirmar(periodo, dia) devuelve un mensaje de error o null si salió bien
export default function ModalGenerarExpensas({ departamentos, cargos, diaVencimiento, onCerrar, onConfirmar }) {
    const [periodo, setPeriodo] = useState(hoy().slice(0, 7));
    const [dia, setDia] = useState(diaVencimiento);

    const activos = departamentos.filter((d) => d.estado === 'activo');
    const yaEmitidos = new Set(cargos.filter((c) => c.concepto === 'Expensas' && c.periodo === periodo).map((c) => c.id_departamento));
    const aEmitir = activos.filter((d) => !yaEmitidos.has(d.id_departamento));
    const sinPropietario = aEmitir.filter((d) => !d.propietario).length;
    const total = aEmitir.reduce((suma, d) => suma + Number(d.cuota_mensual), 0);

    return (
        <Modal titulo="Generar expensas del mes" textoAceptar={'Emitir ' + aEmitir.length + ' expensas'}
            descripcion="Se emite un cargo por departamento activo con la cuota de su tipo."
            deshabilitado={!periodo || aEmitir.length === 0}
            onCerrar={onCerrar} onAceptar={() => onConfirmar(periodo, Number(dia))}>
            <div className="row g-3">
                <Campo etiqueta="Mes" requerido ancho="col-md-7">
                    <input type="month" className="form-control" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
                </Campo>
                <Campo etiqueta="Día de vencimiento" requerido ancho="col-md-5">
                    <input type="number" className="form-control" min="1" max="28" value={dia} onChange={(e) => setDia(e.target.value)} />
                </Campo>
                {periodo && (
                    <div className="col-12">
                        <div className="cuenta-resumen mb-3">
                            <dl>
                                <dt>Departamentos activos</dt><dd>{activos.length}</dd>
                                <dt>Ya tienen la expensa de {mesLargo(periodo)}</dt><dd>{yaEmitidos.size}</dd>
                                <dt>Se emitirán</dt><dd><strong>{aEmitir.length}</strong></dd>
                                <dt>Total a cobrar</dt><dd><strong>{dinero(total)}</strong></dd>
                            </dl>
                        </div>
                        {aEmitir.length === 0 ? (
                            <Nota tono="bueno">Todos los departamentos activos ya tienen la expensa de {mesLargo(periodo)}.</Nota>
                        ) : (
                            <Nota tono="info">Si un departamento tiene saldo a favor, se descuenta automáticamente de su nueva expensa.</Nota>
                        )}
                        {sinPropietario > 0 && (
                            <div className="mt-2">
                                <Nota tono="aviso">
                                    {sinPropietario} {sinPropietario === 1 ? 'departamento no tiene' : 'departamentos no tienen'} propietario
                                    registrado: el cargo quedará sin responsable.
                                </Nota>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
