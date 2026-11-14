import Campo from '../components/Campo';
import Casilla from '../components/Casilla';
import Opciones from '../components/Opciones';
import Nota from '../components/Nota';
import Icono from '../components/Icono';
import VistaPreviaPago from './VistaPreviaPago';
import { METODOS_PAGO, MAX_MESES_ADELANTO, CONCEPTO_EXPENSAS } from '../opciones';
import { dinero, sumar } from '../formato';
import { periodosAdelantados, simularPago } from '../logica/pagos';

// Campos del pago (izquierda) y cuenta del departamento con la vista previa (derecha)
//   pendientes: cargos con saldo de todos los departamentos
export default function FormularioPago({ formulario, cambiar, actualizar, departamentos, tipos, pendientes }) {
    const esNuevo = formulario.id_ingreso == 0;
    const aplica = formulario.aplica_deuda;
    const meses = Number(formulario.meses_adelantados) || 0;
    const departamento = departamentos.find((d) => d.id_departamento == formulario.id_departamento);
    const cuota = Number(departamento ? departamento.cuota_mensual : 0);
    const saldoFavor = Number(departamento ? departamento.saldo_favor : 0);
    const deudas = pendientes.filter((c) => c.id_departamento == formulario.id_departamento);
    const deuda = sumar(deudas, 'saldo');

    const adelantos = esNuevo && aplica && departamento
        ? periodosAdelantados(departamento.ultima_expensa, meses)
            .map((periodo) => ({ clave: 'nuevo-' + periodo, concepto: CONCEPTO_EXPENSAS, periodo, saldo: cuota, nuevo: true }))
        : [];
    const cargosVista = deudas.map((c) => ({ clave: 'cargo-' + c.id_cargo, concepto: c.concepto, periodo: c.periodo, saldo: c.saldo }))
        .concat(adelantos);
    const simulacion = simularPago(formulario.monto, saldoFavor, cargosVista);

    // Monto para dejar la cuenta al día más los meses adelantados
    function sugerido(cantidadMeses) {
        let valor = deuda + cantidadMeses * cuota - saldoFavor;
        return valor > 0 ? valor.toFixed(2) : '';
    }

    function cambiarMeses(valor) {
        let cantidad = Math.min(Math.max(Math.trunc(Number(valor) || 0), 0), MAX_MESES_ADELANTO);
        actualizar({ meses_adelantados: cantidad, monto: sugerido(cantidad) });
    }

    return (
        <div className="row g-4">
            <div className="col-lg-7">
                <div className="row g-3">
                    <Campo etiqueta="Departamento" requerido ancho="col-sm-6">
                        <select name="id_departamento" className="form-select" value={formulario.id_departamento}
                            onChange={(e) => actualizar({ id_departamento: e.target.value, meses_adelantados: 0 })}>
                            <Opciones lista={departamentos} valor="id_departamento" texto="numero" />
                        </select>
                    </Campo>
                    <Campo etiqueta="Tipo de ingreso" requerido ancho="col-sm-6">
                        <select name="id_tipo_ingreso" className="form-select" value={formulario.id_tipo_ingreso} onChange={cambiar}>
                            <Opciones lista={tipos} valor="id_tipo_ingreso" texto="nombre" />
                        </select>
                    </Campo>
                    <div className="col-12">
                        <Casilla etiqueta="Aplicar a la deuda del departamento" marcado={aplica}
                            descripcion="Desactívelo para ingresos que no pagan cargos, como el alquiler del salón de eventos."
                            onCambiar={(valor) => actualizar({ aplica_deuda: valor, meses_adelantados: 0 })} />
                    </div>
                    {esNuevo && aplica && (
                        <Campo etiqueta="Meses por adelantado" ancho="col-sm-6" ayuda={cuota > 0 ? 'Cuota mensual ' + dinero(cuota) : undefined}>
                            <div className="contador">
                                <button type="button" className="btn btn-light" aria-label="Quitar un mes"
                                    disabled={meses === 0} onClick={() => cambiarMeses(meses - 1)}>
                                    <Icono nombre="menos" tamano={16} />
                                </button>
                                <input type="number" className="form-control text-center" min="0" max={MAX_MESES_ADELANTO}
                                    aria-label="Meses por adelantado" value={meses} onChange={(e) => cambiarMeses(e.target.value)} />
                                <button type="button" className="btn btn-light" aria-label="Agregar un mes"
                                    disabled={meses === MAX_MESES_ADELANTO} onClick={() => cambiarMeses(meses + 1)}>
                                    <Icono nombre="mas" tamano={16} />
                                </button>
                            </div>
                        </Campo>
                    )}
                    <Campo etiqueta="Monto recibido (Bs)" requerido ancho={esNuevo && aplica ? 'col-sm-6' : 'col-12'}>
                        <input name="monto" type="number" step="0.01" min="0" className="form-control monto-entrada" placeholder="0.00"
                            autoFocus value={formulario.monto} onChange={cambiar} />
                    </Campo>
                    {esNuevo && aplica && deuda - saldoFavor > 0 && (
                        <div className="col-12 atajos">
                            <span>Atajos:</span>
                            <button type="button" className="btn btn-sm btn-outline-primary"
                                onClick={() => actualizar({ monto: sugerido(meses) })}>
                                Pagar todo: {dinero(sugerido(meses))}
                            </button>
                            {cuota > 0 && deuda > cuota && (
                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                    onClick={() => actualizar({ monto: cuota.toFixed(2) })}>
                                    Una cuota: {dinero(cuota)}
                                </button>
                            )}
                        </div>
                    )}
                    <Campo etiqueta="Fecha de pago" requerido ancho="col-sm-6">
                        <input name="fecha" type="date" className="form-control" value={formulario.fecha} onChange={cambiar} />
                    </Campo>
                    <Campo etiqueta="Método de pago" requerido ancho="col-sm-6">
                        <select name="metodo_pago" className="form-select" value={formulario.metodo_pago} onChange={cambiar}>
                            <Opciones lista={METODOS_PAGO} />
                        </select>
                    </Campo>
                    <Campo etiqueta="Concepto" requerido>
                        <input name="concepto" className="form-control" maxLength="180" placeholder="Ej. Pago de expensas"
                            value={formulario.concepto} onChange={cambiar} />
                    </Campo>
                </div>
            </div>

            <div className="col-lg-5">
                <div className="cuenta-resumen">
                    <h6>Cuenta del departamento</h6>
                    <dl>
                        <dt>Propietario</dt>
                        <dd>{departamento && departamento.propietario ? departamento.propietario : 'Sin propietario registrado'}</dd>
                        <dt>Deuda pendiente</dt>
                        <dd className={deuda > 0 ? 'texto-deuda' : ''}>{dinero(deuda)}</dd>
                        <dt>Saldo a favor</dt>
                        <dd className={saldoFavor > 0 ? 'sube' : ''}>{dinero(saldoFavor)}</dd>
                    </dl>
                </div>
                {!aplica ? (
                    <Nota tono="info">Este ingreso se registra sin aplicarse a la deuda del departamento.</Nota>
                ) : !esNuevo ? (
                    <Nota tono="info">Al guardar, el sistema vuelve a calcular a qué cargos se aplica este pago.</Nota>
                ) : (
                    <VistaPreviaPago simulacion={simulacion} monto={formulario.monto} />
                )}
            </div>
        </div>
    );
}
