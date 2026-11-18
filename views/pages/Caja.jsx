import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import { coincide, dinero, dineroConSigno, formatoFecha, hoy, mesActual, sumar, textoAnulacion } from '../formato';
import { SENTIDOS_CAJA, ESTADOS_MOVIMIENTO } from '../opciones';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Resumen from '../components/Resumen';
import PanelTabla from '../components/PanelTabla';
import Buscador from '../components/Buscador';
import Filtro from '../components/Filtro';
import SinDatos from '../components/SinDatos';
import Estado from '../components/Estado';
import Acciones from '../components/Acciones';
import Modal from '../components/Modal';
import Campo from '../components/Campo';
import Opciones from '../components/Opciones';
import Nota from '../components/Nota';
import ModalAnular from '../secciones/ModalAnular';

const SALDOS_VACIOS = { saldo: 0, efectivo: 0, banco: 0 };
const sentidoDe = (valor) => SENTIDOS_CAJA.find((s) => s.valor === valor);

// Dónde está el dinero del condominio (caja o banco) y los depósitos y retiros entre ambos.
// Los saldos salen de los pagos y gastos según su método de pago; aquí solo se registra el
// dinero que cambia de lugar.
export default function Caja() {
    const crud = useCrud({
        rutas: { obtener: '/api/caja/obtenerCaja', guardar: '/api/caja/guardarMovimiento' },
        id: 'id_movimiento_caja', nombre: 'El movimiento', inicial: { Saldos: SALDOS_VACIOS, Movimientos: [] }
    });
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [aAnular, setAAnular] = useState(null);   // movimiento que se va a anular

    const { Saldos: saldos, Movimientos: movimientos } = crud.datos;
    const formulario = crud.formulario;

    function adicionar() {
        crud.abrirFormulario({ sentido: 'caja_a_banco', monto: '', fecha: hoy(), observacion: '' });
    }

    async function anular(motivo) {
        let error = await crud.ejecutar('/api/caja/anularMovimiento', { id_movimiento_caja: aAnular.id_movimiento_caja, motivo },
            'El movimiento se anuló y el dinero volvió a su lugar');
        if (error) {
            return error;
        }
        setAAnular(null);
    }

    const registrados = movimientos.filter((m) => m.estado === 'registrado');
    const depositadoMes = sumar(registrados.filter((m) => m.sentido === 'caja_a_banco' && m.fecha.startsWith(mesActual())));
    const filtrados = movimientos.filter((m) => (filtroEstado === '' || m.estado === filtroEstado)
        && coincide(busqueda, sentidoDe(m.sentido).corto, m.observacion, m.usuario));

    // Dinero que hay en el lugar de donde sale el movimiento que se está registrando
    const origen = formulario ? sentidoDe(formulario.sentido).origen : 'efectivo';
    const disponible = Number(saldos[origen]);
    const excede = formulario ? Number(formulario.monto) > disponible : false;

    return (
        <>
            <Encabezado titulo="Caja y banco"
                descripcion="Dónde está el dinero: el efectivo en la caja; transferencias, QR y tarjeta en el banco."
                textoBoton="Registrar movimiento" onAdicionar={adicionar} />
            <Alerta mensaje={crud.mensaje} onCerrar={crud.cerrarMensaje} />

            <Resumen items={[
                {
                    etiqueta: 'Efectivo en caja', valor: dineroConSigno(saldos.efectivo), detalle: 'Cobros y gastos en efectivo', ayuda: 'caja',
                    tono: Number(saldos.efectivo) < 0 ? 'critico' : undefined
                },
                {
                    etiqueta: 'En el banco', valor: dineroConSigno(saldos.banco), detalle: 'Transferencias, QR y tarjeta', ayuda: 'banco',
                    tono: Number(saldos.banco) < 0 ? 'critico' : undefined
                },
                { etiqueta: 'Disponible en total', valor: dineroConSigno(saldos.saldo), detalle: 'Caja más banco', ayuda: 'disponible' },
                { etiqueta: 'Depositado este mes', valor: dinero(depositadoMes), detalle: 'De la caja al banco' }
            ]} />

            <PanelTabla mostrados={filtrados.length} total={movimientos.length} herramientas={<>
                <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar por movimiento, observación o usuario" />
                <Filtro etiqueta="Filtrar por estado" todos="Todos los estados" opciones={ESTADOS_MOVIMIENTO}
                    valor={filtroEstado} onCambiar={setFiltroEstado} />
            </>}>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Movimiento</th>
                        <th className="text-end">Monto</th>
                        <th>Observación</th>
                        <th>Registró</th>
                        <th>Estado</th>
                        <th className="text-end columna-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.length === 0 && <SinDatos columnas={7} cargando={crud.cargando} filtrado={movimientos.length > 0}
                        titulo="Todavía no hay depósitos ni retiros"
                        texto="Cuando lleve el efectivo cobrado al banco, regístrelo aquí para que el saldo de la caja y el del banco coincidan con la realidad."
                        accion={{ texto: 'Registrar un depósito', onClick: adicionar }} />}
                    {filtrados.map((movimiento) => (
                        <tr key={movimiento.id_movimiento_caja} className={movimiento.estado === 'anulado' ? 'anulado' : ''}>
                            <td className="text-nowrap">{formatoFecha(movimiento.fecha)}</td>
                            <td>{sentidoDe(movimiento.sentido).corto}</td>
                            <td className="text-end numero fw-semibold monto">{dinero(movimiento.monto)}</td>
                            <td>{movimiento.observacion || <span className="text-body-tertiary">—</span>}</td>
                            <td>{movimiento.usuario}</td>
                            <td>
                                <Estado valor={movimiento.estado} />
                                {movimiento.motivo_anulacion && (
                                    <span className="secundario" title={textoAnulacion(movimiento)}>{movimiento.motivo_anulacion}</span>
                                )}
                            </td>
                            <Acciones onEliminar={movimiento.estado === 'registrado' ? () => setAAnular(movimiento) : undefined}
                                tituloEliminar="Anular" iconoEliminar="anular" />
                        </tr>
                    ))}
                </tbody>
            </PanelTabla>

            {formulario && (
                <Modal titulo="Registrar movimiento" textoAceptar="Registrar movimiento"
                    descripcion="No es un ingreso ni un gasto: el dinero del condominio es el mismo, solo cambia de lugar."
                    error={crud.error} deshabilitado={!(Number(formulario.monto) > 0) || excede}
                    onCerrar={crud.cerrarFormulario} onAceptar={crud.guardar}>
                    <div className="row g-3">
                        <Campo etiqueta="Movimiento" requerido>
                            <select name="sentido" className="form-select" value={formulario.sentido} onChange={crud.cambiar}>
                                <Opciones lista={SENTIDOS_CAJA} />
                            </select>
                        </Campo>
                        <Campo etiqueta="Monto (Bs)" requerido ancho="col-md-6">
                            <input name="monto" type="number" step="0.01" min="0" className="form-control monto-entrada" placeholder="0.00"
                                autoFocus value={formulario.monto} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Fecha" requerido ancho="col-md-6">
                            <input name="fecha" type="date" className="form-control" max={hoy()} value={formulario.fecha} onChange={crud.cambiar} />
                        </Campo>
                        <Campo etiqueta="Observación">
                            <input name="observacion" className="form-control" maxLength="250" placeholder="Ej. Boleta de depósito Nº 45871"
                                value={formulario.observacion} onChange={crud.cambiar} />
                        </Campo>
                        <div className="col-12">
                            {excede ? (
                                <Nota tono="critico" titulo={'No hay tanto dinero en ' + (origen === 'efectivo' ? 'la caja' : 'el banco')}>
                                    Ahí hay {dinero(disponible)}. Revise el monto o registre primero los pagos que faltan.
                                </Nota>
                            ) : (
                                <Nota tono="info">
                                    Disponible en {origen === 'efectivo' ? 'la caja' : 'el banco'}: <b>{dinero(disponible)}</b>
                                </Nota>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {aAnular && (
                <ModalAnular titulo="Anular movimiento" placeholder="Ej. Se registró con un monto equivocado"
                    descripcion="El movimiento queda en el historial como anulado y el dinero vuelve al lugar donde estaba."
                    onCerrar={() => setAAnular(null)} onConfirmar={anular}>
                    {sentidoDe(aAnular.sentido).corto} de <b>{dinero(aAnular.monto)}</b> del {formatoFecha(aAnular.fecha)}.
                </ModalAnular>
            )}
        </>
    );
}
