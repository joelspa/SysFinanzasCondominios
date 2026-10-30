import { useState, useEffect } from 'react';
import { obtener, enviar, sinNulos } from '../api';
import Encabezado from '../components/Encabezado';
import Alerta from '../components/Alerta';
import Modal from '../components/Modal';
import Acciones from '../components/Acciones';
import Estado from '../components/Estado';
import SinDatos from '../components/SinDatos';

const metodosPago = ['efectivo', 'transferencia', 'QR', 'tarjeta'];

export default function Ingresos() {
    const [ingresos, setIngresos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [formulario, setFormulario] = useState(null);   // ingreso que se está editando (null = modal cerrado)
    const [aEliminar, setAEliminar] = useState(null);     // ingreso que se va a eliminar
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState(null);

    async function cargar() {
        let resultado = await obtener('/api/ingreso/obtenerIngresos');
        if (resultado.Success) {
            setIngresos(resultado.Data.Ingresos);
            setDepartamentos(resultado.Data.Departamentos);
            setTipos(resultado.Data.Tipos);
            setCargos(resultado.Data.Cargos);
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    useEffect(() => { cargar(); }, []);

    function abrirFormulario(ingreso) {
        setError('');
        setFormulario(sinNulos(ingreso));
    }

    function adicionar() {
        if (departamentos.length === 0) {
            setMensaje({ tipo: 'warning', texto: 'Primero debe registrar al menos un departamento' });
            return;
        }
        abrirFormulario({
            id_ingreso: 0, id_departamento: departamentos[0].id_departamento, id_cargo: '',
            id_tipo_ingreso: tipos.length > 0 ? tipos[0].id_tipo_ingreso : '', concepto: '', monto: '',
            fecha: new Date().toLocaleDateString('en-CA'), metodo_pago: 'efectivo', estado: 'registrado'
        });
    }

    function cambiar(e) {
        let cambios = { [e.target.name]: e.target.value };
        if (e.target.name === 'id_departamento') {
            // Los cargos son de cada departamento: al cambiarlo se quita el cargo elegido
            cambios.id_cargo = '';
        }
        if (e.target.name === 'id_cargo' && e.target.value !== '') {
            // Al elegir un cargo se copian su concepto y su monto
            let cargo = cargos.find((c) => c.id_cargo == e.target.value);
            cambios.concepto = cargo.concepto + ' ' + cargo.periodo;
            cambios.monto = cargo.monto;
        }
        setFormulario({ ...formulario, ...cambios });
    }

    // Cargos del departamento elegido que aún no se pagaron (o el que ya tenía este ingreso)
    function cargosDisponibles() {
        let original = ingresos.find((i) => i.id_ingreso == formulario.id_ingreso);
        return cargos.filter((c) => c.id_departamento == formulario.id_departamento
            && (c.estado !== 'pagado' || (original && original.id_cargo == c.id_cargo)));
    }

    async function guardar() {
        let resultado = await enviar('/api/ingreso/guardarIngreso', formulario);
        if (resultado.Success) {
            setFormulario(null);
            setMensaje({ tipo: 'success', texto: 'El ingreso se guardó correctamente' });
            cargar();
        } else {
            setError(resultado.Mensaje);
        }
    }

    async function eliminar() {
        let resultado = await enviar('/api/ingreso/eliminarIngreso', { id_ingreso: aEliminar.id_ingreso });
        setAEliminar(null);
        if (resultado.Success) {
            setMensaje({ tipo: 'success', texto: 'El ingreso se eliminó correctamente' });
            cargar();
        } else {
            setMensaje({ tipo: 'danger', texto: resultado.Mensaje });
        }
    }

    // Suma solo los ingresos registrados (los anulados no cuentan)
    let total = ingresos.filter((i) => i.estado === 'registrado')
        .reduce((suma, i) => suma + Number(i.monto), 0);

    return (
        <>
            <Encabezado titulo="Ingresos"
                descripcion="Pagos de cada departamento. Si el pago cancela un cargo, el cargo queda como pagado."
                onAdicionar={adicionar} />
            <Alerta mensaje={mensaje} onCerrar={() => setMensaje(null)} />

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Código</th>
                                <th className="text-center">Fecha</th>
                                <th className="text-center">Departamento</th>
                                <th>Tipo</th>
                                <th>Concepto</th>
                                <th>Método de pago</th>
                                <th className="text-end">Monto</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingresos.length === 0 && <SinDatos columnas={9} />}
                            {ingresos.map((ingreso) => (
                                <tr key={ingreso.id_ingreso}>
                                    <td className="text-center">{ingreso.id_ingreso}</td>
                                    <td className="text-center">{ingreso.fecha}</td>
                                    <td className="text-center">{ingreso.departamento}</td>
                                    <td>{ingreso.tipo_ingreso}</td>
                                    <td>{ingreso.concepto}</td>
                                    <td>{ingreso.metodo_pago}</td>
                                    <td className="text-end">{ingreso.monto}</td>
                                    <td className="text-center"><Estado valor={ingreso.estado} /></td>
                                    <Acciones onEditar={() => abrirFormulario(ingreso)} onEliminar={() => setAEliminar(ingreso)} />
                                </tr>
                            ))}
                        </tbody>
                        {ingresos.length > 0 && (
                            <tfoot className="table-light">
                                <tr>
                                    <th colSpan={6} className="text-end">Total registrado</th>
                                    <th className="text-end">{total.toFixed(2)}</th>
                                    <th colSpan={2}></th>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {formulario && (
                <Modal titulo={formulario.id_ingreso == 0 ? 'Adicionar ingreso' : 'Editar ingreso'}
                    error={error} onCerrar={() => setFormulario(null)} onAceptar={guardar}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Departamento *</label>
                            <select name="id_departamento" className="form-select" value={formulario.id_departamento} onChange={cambiar}>
                                {departamentos.map((departamento) => (
                                    <option key={departamento.id_departamento} value={departamento.id_departamento}>{departamento.numero}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Tipo de ingreso *</label>
                            <select name="id_tipo_ingreso" className="form-select" value={formulario.id_tipo_ingreso} onChange={cambiar}>
                                {tipos.map((tipo) => (
                                    <option key={tipo.id_tipo_ingreso} value={tipo.id_tipo_ingreso}>{tipo.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Cargo que paga</label>
                            <select name="id_cargo" className="form-select" value={formulario.id_cargo} onChange={cambiar}>
                                <option value="">Ninguno (ingreso extraordinario)</option>
                                {cargosDisponibles().map((cargo) => (
                                    <option key={cargo.id_cargo} value={cargo.id_cargo}>
                                        {cargo.concepto} {cargo.periodo}: {cargo.monto} ({cargo.estado})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Concepto *</label>
                            <input name="concepto" className="form-control" maxLength="180" value={formulario.concepto} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Monto *</label>
                            <input name="monto" type="number" step="0.01" min="0" className="form-control"
                                value={formulario.monto} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Fecha *</label>
                            <input name="fecha" type="date" className="form-control" value={formulario.fecha} onChange={cambiar} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Método de pago *</label>
                            <select name="metodo_pago" className="form-select" value={formulario.metodo_pago} onChange={cambiar}>
                                {metodosPago.map((metodo) => (
                                    <option key={metodo} value={metodo}>{metodo}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Estado *</label>
                            <select name="estado" className="form-select" value={formulario.estado} onChange={cambiar}>
                                <option value="registrado">Registrado</option>
                                <option value="anulado">Anulado</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {aEliminar && (
                <Modal titulo="Eliminar ingreso" textoAceptar="Eliminar" colorAceptar="danger"
                    onCerrar={() => setAEliminar(null)} onAceptar={eliminar}>
                    ¿Está seguro que desea eliminar el ingreso <b>{aEliminar.concepto}</b> del departamento <b>{aEliminar.departamento}</b>?
                    {aEliminar.id_cargo && <div className="text-muted small mt-2">El cargo que pagaba volverá a quedar pendiente.</div>}
                </Modal>
            )}
        </>
    );
}
