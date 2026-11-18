// Qué significa cada término del sistema, dicho en palabras simples.
// Una sola fuente: la usan las ayudas «?» de las pantallas y el glosario de la página Ayuda.
export const GLOSARIO = {
    expensa: {
        termino: 'Expensa',
        texto: 'Cuota mensual que paga cada departamento para cubrir los gastos comunes del condominio. El monto depende del tipo de departamento.'
    },
    cargo: {
        termino: 'Cargo',
        texto: 'Todo lo que se le cobra a un departamento: la expensa del mes, una multa o una cuota extraordinaria. Cada cargo tiene una fecha de vencimiento.'
    },
    porCobrar: {
        termino: 'Por cobrar',
        texto: 'Lo que los departamentos todavía deben y aún no venció.'
    },
    deudaTotal: {
        termino: 'Total por cobrar',
        texto: 'Todo lo que los departamentos deben hoy, esté vencido o no. La parte vencida es la que está en mora.'
    },
    mora: {
        termino: 'En mora',
        texto: 'Un departamento está en mora cuando tiene cargos cuya fecha de vencimiento ya pasó y no se pagaron completos.'
    },
    saldoFavor: {
        termino: 'Saldo a favor',
        texto: 'Dinero que un departamento pagó de más. Queda guardado en el departamento y se descuenta solo de su próxima expensa.'
    },
    pagoParcial: {
        termino: 'Pago parcial',
        texto: 'Cuando se paga solo una parte de un cargo. El resto queda pendiente y sigue figurando como deuda.'
    },
    recibo: {
        termino: 'Recibo',
        texto: 'Comprobante numerado que se entrega por cada pago. Una vez emitido no cambia: si tiene un error se anula y se emite otro.'
    },
    anular: {
        termino: 'Anular',
        texto: 'Dejar sin efecto un pago, un gasto o un movimiento de caja. No se borra: queda en el historial con el motivo, quién lo anuló y cuándo.'
    },
    disponible: {
        termino: 'Disponible',
        texto: 'Todo el dinero del condominio: lo cobrado menos lo gastado. Una parte está en la caja (efectivo) y otra en el banco.'
    },
    caja: {
        termino: 'Caja',
        texto: 'Efectivo que guarda la administración. Sube con los cobros en efectivo y baja con los gastos en efectivo y los depósitos al banco.'
    },
    banco: {
        termino: 'Banco',
        texto: 'Dinero en la cuenta del condominio: lo que entra o sale por transferencia, QR o tarjeta, más los depósitos de efectivo.'
    },
    resultadoMes: {
        termino: 'Resultado del mes',
        texto: 'Lo cobrado en el mes menos lo gastado en el mes. Si es negativo, ese mes salió más dinero del que entró.'
    },
    traspaso: {
        termino: 'Traspaso',
        texto: 'Cambio de dueño de un departamento. La deuda pertenece al departamento, no a la persona: quien lo compra asume lo que se debe.'
    },
    responsable: {
        termino: 'Responsable',
        texto: 'Persona a cuyo nombre está un cargo: el propietario del departamento. Si el departamento se vende, los cargos pendientes pasan al nuevo dueño.'
    },
    residente: {
        termino: 'Residente',
        texto: 'Persona vinculada a un departamento: su propietario, un inquilino o un familiar. Una misma persona puede serlo en varios departamentos.'
    },
    tesorero: {
        termino: 'Tesorero',
        texto: 'Usuario que hace el trabajo diario (cobrar, registrar gastos, emitir expensas) en los condominios que tiene asignados. No entra a Configuración ni a Usuarios.'
    }
};
