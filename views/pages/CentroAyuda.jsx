import Encabezado from '../components/Encabezado';
import Icono from '../components/Icono';
import { GLOSARIO } from '../glosario';
import { tieneGuia } from '../guias';
import { RUTAS_ADMIN } from '../opciones';

// El trabajo en el mismo orden que el diagrama docs/flujo-de-uso.drawio
const ETAPAS = [
    {
        titulo: 'Para empezar',
        descripcion: 'Se hace una sola vez por condominio.',
        pasos: [
            { texto: 'Completar los datos del condominio y la cuota mensual de cada tipo de departamento', ruta: '/configuracion', pantalla: 'Configuración' },
            { texto: 'Registrar los departamentos', ruta: '/departamento', pantalla: 'Departamentos' },
            { texto: 'Registrar a los propietarios e inquilinos, con su CI o NIT', ruta: '/persona', pantalla: 'Personas' },
            { texto: 'Indicar quién es el propietario y quién vive en cada departamento', ruta: '/residente', pantalla: 'Residentes' },
            { texto: 'Crear un usuario para cada tesorero', ruta: '/usuario', pantalla: 'Usuarios' }
        ]
    },
    {
        titulo: 'Todos los meses',
        descripcion: 'El trabajo de cada mes, en orden.',
        pasos: [
            { texto: 'Generar las expensas del mes', ruta: '/cargo', pantalla: 'Cuentas por cobrar' },
            { texto: 'Imprimir y repartir los avisos de cobranza', ruta: '/cargo/avisos', pantalla: 'Cuentas por cobrar' },
            { texto: 'Registrar cada pago y entregar su recibo', ruta: '/ingreso', pantalla: 'Ingresos' },
            { texto: 'Registrar los gastos, con su factura o recibo', ruta: '/egreso', pantalla: 'Gastos' },
            { texto: 'Depositar en el banco el efectivo cobrado y anotarlo', ruta: '/caja', pantalla: 'Caja y banco' },
            { texto: 'Imprimir el reporte del mes y presentar las cuentas a los propietarios', ruta: '/reporte', pantalla: 'Reporte mensual' }
        ]
    },
    {
        titulo: 'Cuando haga falta',
        descripcion: 'Situaciones que no se dan todos los meses.',
        pasos: [
            { texto: 'Se vende un departamento: abrir su ficha y registrar el traspaso', ruta: '/departamento', pantalla: 'Departamentos' },
            { texto: 'Hay un error en un recibo o en un gasto: anularlo y registrarlo de nuevo', ruta: '/ingreso', pantalla: 'Ingresos o Gastos' },
            { texto: 'Hay que cobrar una multa o una cuota extraordinaria: crear un cargo nuevo', ruta: '/cargo', pantalla: 'Cuentas por cobrar' },
            { texto: 'Entra dinero que no es de un departamento: registrarlo como ingreso sin departamento', ruta: '/ingreso', pantalla: 'Ingresos' },
            { texto: 'Se administra otro condominio: crearlo y elegirlo para trabajar en él', ruta: '/condominio', pantalla: 'Condominios' }
        ]
    }
];

const PREGUNTAS = [
    {
        pregunta: '¿Qué pasa si un vecino paga menos de lo que debe?',
        respuesta: 'El pago cubre primero su deuda más antigua y lo que falta queda pendiente. Si pasa la fecha de vencimiento, el departamento aparece en mora. Antes de guardar el pago, el formulario muestra exactamente a qué meses se aplica.'
    },
    {
        pregunta: '¿Y si paga de más o quiere adelantar meses?',
        respuesta: 'Lo que sobra queda como saldo a favor del departamento y se descuenta solo de su próxima expensa. Para adelantar, use «Meses por adelantado» al registrar el pago: el sistema emite esas expensas y las da por pagadas.'
    },
    {
        pregunta: 'Me equivoqué en un recibo, ¿cómo lo corrijo?',
        respuesta: 'Con el lápiz se corrigen el concepto, el método de pago y quién pagó. El monto, la fecha y el departamento no cambian porque el recibo ya se entregó: anúlelo indicando el motivo y registre uno nuevo.'
    },
    {
        pregunta: '¿Por qué no puedo eliminar un pago o un gasto?',
        respuesta: 'Para que las cuentas siempre se puedan revisar. Se anulan: dejan de contar en los saldos, pero quedan en el historial con el motivo, quién los anuló y cuándo.'
    },
    {
        pregunta: '¿Qué pasa con la deuda cuando se vende un departamento?',
        respuesta: 'La deuda pertenece al departamento, no a la persona: quien lo compra la asume. Al registrar el traspaso, los cargos pendientes pasan a nombre del nuevo propietario; lo ya pagado queda a nombre del anterior. El saldo a favor, si había, también se queda en el departamento.'
    },
    {
        pregunta: '¿Cómo sé qué departamentos deben?',
        respuesta: 'En el panel principal, en «Departamentos con deuda». En Cuentas por cobrar puede filtrar por estado «Vencido», y el reporte mensual trae la lista de departamentos en mora.'
    },
    {
        pregunta: '¿Por qué la caja y el banco tienen saldos distintos?',
        respuesta: 'Lo cobrado en efectivo queda en la caja y lo que llega por transferencia, QR o tarjeta, en el banco. Cuando lleve el efectivo al banco, registre el depósito en Caja y banco para que los dos saldos coincidan con la realidad.'
    },
    {
        pregunta: '¿Qué puede hacer un tesorero?',
        respuesta: 'Todo el trabajo diario (emitir expensas, cobrar, registrar gastos y depósitos, ver reportes) en los condominios que tiene asignados. La configuración, los usuarios y la creación de condominios son del administrador.'
    },
    {
        pregunta: 'Olvidé mi contraseña',
        respuesta: 'Pídale al administrador que le asigne una nueva desde Usuarios. Después puede cambiarla usted mismo con el ícono de llave, abajo en el menú.'
    },
    {
        pregunta: '¿Puedo volver a ver la guía de una pantalla?',
        respuesta: 'Sí: pulse «Guía de esta pantalla», arriba a la derecha, o «Ver guía» junto a cada paso de esta página.'
    }
];

// Centro de ayuda: el trabajo paso a paso (cada paso lleva a su pantalla y a su guía),
// las preguntas frecuentes y el glosario
export default function CentroAyuda({ usuario }) {
    const esAdmin = usuario.rol === 'admin';
    const glosario = Object.values(GLOSARIO).sort((a, b) => a.termino.localeCompare(b.termino, 'es'));
    let numero = 0;

    return (
        <div className="centro-ayuda">
            <Encabezado titulo="Ayuda" descripcion="Cómo se usa el sistema, las dudas más comunes y qué significa cada término." />

            <nav className="ayuda-indice" aria-label="Secciones de la ayuda">
                <a href="#paso-a-paso">El trabajo paso a paso</a>
                <a href="#preguntas">Preguntas frecuentes</a>
                <a href="#glosario">Glosario</a>
            </nav>

            <section id="paso-a-paso" className="ayuda-seccion">
                <h2>El trabajo paso a paso</h2>
                <div className="ayuda-etapas">
                    {ETAPAS.map((etapa) => (
                        <div className="panel ayuda-etapa" key={etapa.titulo}>
                            <div className="panel-cabecera">
                                <div><h3>{etapa.titulo}</h3><p>{etapa.descripcion}</p></div>
                            </div>
                            <ol className="ayuda-pasos">
                                {etapa.pasos.map((paso) => {
                                    let soloAdmin = RUTAS_ADMIN.includes(paso.ruta);
                                    numero += 1;
                                    return (
                                        <li key={paso.texto}>
                                            <span className="ayuda-numero" aria-hidden="true">{numero}</span>
                                            <div className="flex-grow-1">
                                                {paso.texto}
                                                <span className="secundario">
                                                    Menú: {paso.pantalla}{soloAdmin && ' · lo hace el administrador'}
                                                </span>
                                            </div>
                                            {(esAdmin || !soloAdmin) && (
                                                <div className="ayuda-enlaces">
                                                    {tieneGuia(paso.ruta) && <a className="btn btn-sm btn-light" href={paso.ruta + '?guia=1'}>Ver guía</a>}
                                                    <a className="btn btn-sm btn-outline-primary" href={paso.ruta} aria-label={'Ir a ' + paso.pantalla}>
                                                        Ir <Icono nombre="flecha" tamano={14} />
                                                    </a>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    ))}
                </div>
            </section>

            <section id="preguntas" className="ayuda-seccion">
                <h2>Preguntas frecuentes</h2>
                <div className="panel ayuda-preguntas">
                    {PREGUNTAS.map((p) => (
                        <details key={p.pregunta}>
                            <summary>{p.pregunta}<Icono nombre="flecha" tamano={16} className="ayuda-flecha" /></summary>
                            <p>{p.respuesta}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section id="glosario" className="ayuda-seccion">
                <h2>Glosario</h2>
                <dl className="panel ayuda-glosario">
                    {glosario.map((g) => (
                        <div key={g.termino}><dt>{g.termino}</dt><dd>{g.texto}</dd></div>
                    ))}
                </dl>
            </section>
        </div>
    );
}
