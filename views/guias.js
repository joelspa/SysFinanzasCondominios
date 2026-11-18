// Guías de cada pantalla: pasos cortos que resaltan una parte de la página y explican para qué sirve.
// Cada paso: { objetivo, titulo, texto }. objetivo es un selector CSS; sin objetivo, el paso va centrado.
// Los pasos cuyo objetivo no está en pantalla (por ejemplo, un botón que el rol no ve) se saltan solos.
// Cada guía recibe al usuario de la sesión, por si el texto depende de su nombre o de su rol.
const GUIAS = {
    '/': (usuario) => [
        {
            titulo: 'Bienvenido/a, ' + usuario.nombre.split(' ')[0],
            texto: 'En un minuto le mostramos cómo está organizado el sistema. Puede saltar la guía cuando quiera y volver a verla con el botón «Guía de esta pantalla».'
        },
        {
            objetivo: '[data-guia="menu"]',
            titulo: 'El menú sigue el orden del trabajo',
            texto: 'En Finanzas, primero se emite lo que se cobra (Cuentas por cobrar), después se registran los pagos y los gastos, y al cerrar el mes se imprime el reporte.'
        },
        {
            objetivo: '[data-guia="selector-condominio"]',
            titulo: 'El condominio en el que trabaja',
            texto: 'Si administra varios condominios, cámbielo aquí. Todas las pantallas muestran solo los datos del condominio elegido.'
        },
        {
            objetivo: '[data-guia="indicadores"]',
            titulo: 'Cómo está el condominio hoy',
            texto: 'El dinero disponible (en caja y en el banco), el resultado del mes y cuánto falta cobrar. Pase el mouse sobre el «?» de cada cifra para ver qué significa.'
        },
        {
            objetivo: '.encabezado-acciones',
            titulo: 'Lo que más va a usar',
            texto: 'Registrar un pago cuando un vecino paga y registrar un gasto cuando el condominio paga algo.'
        },
        {
            objetivo: '[data-guia="boton-guia"]',
            titulo: 'Siempre hay ayuda',
            texto: 'Cada pantalla tiene su propia guía en este botón. En «Ayuda», en el menú, está el paso a paso completo, las preguntas frecuentes y el significado de cada término.'
        }
    ],
    '/cargo': () => [
        {
            objetivo: '[data-guia="generar-expensas"]',
            titulo: 'Al empezar cada mes',
            texto: 'Genere las expensas del mes: el sistema crea un cobro para cada departamento con la cuota de su tipo. No duplica las que ya existen.'
        },
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Cobros extra',
            texto: 'Para una multa o una cuota extraordinaria, cree un cargo nuevo para ese departamento.'
        },
        {
            objetivo: '.resumen',
            titulo: 'Lo emitido y lo cobrado',
            texto: 'Cuánto se emitió, cuánto ya se cobró, cuánto falta sin vencer y cuánto está en mora.'
        },
        {
            objetivo: '.panel-tabla',
            titulo: 'Cada cobro con su estado',
            texto: 'La barra muestra cuánto se pagó. En las filas con deuda, el ícono de billete abre el pago de ese departamento.'
        },
        {
            objetivo: '[href="/cargo/avisos"]',
            titulo: 'Avisos de cobranza',
            texto: 'Imprime una hoja por departamento con lo que debe, lista para repartir.'
        }
    ],
    '/ingreso': () => [
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Registrar un pago',
            texto: 'Elija el departamento y escriba el monto. Antes de guardar verá a qué meses se aplica: siempre cubre primero la deuda más antigua.'
        },
        {
            objetivo: '.resumen',
            titulo: 'La recaudación',
            texto: 'Lo cobrado en el mes, lo que todavía se debe y los saldos a favor de quienes pagaron de más.'
        },
        {
            objetivo: '.panel-tabla',
            titulo: 'Cada fila es un recibo',
            texto: 'Con su número y los meses que cubre. Desde aquí se ve e imprime el recibo, se corrige un dato o se anula si hubo un error.'
        }
    ],
    '/egreso': () => [
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Registrar un gasto',
            texto: 'Anote a quién se le pagó y el número de su factura o recibo: queda como respaldo en el reporte del mes.'
        },
        {
            objetivo: '.resumen',
            titulo: 'Cuánto hay y cuánto se gastó',
            texto: 'El dinero disponible, separado en caja y banco, y lo gastado en el mes.'
        },
        {
            objetivo: '.panel-tabla',
            titulo: 'Cada gasto con su comprobante',
            texto: 'Si un gasto tiene un error en el monto o la fecha, anúlelo y regístrelo de nuevo.'
        }
    ],
    '/caja': () => [
        {
            objetivo: '.resumen',
            titulo: 'Dónde está el dinero',
            texto: 'Lo cobrado en efectivo está en la caja; lo que entra por transferencia, QR o tarjeta, en el banco.'
        },
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Depósitos y retiros',
            texto: 'Cuando lleve el efectivo al banco (o saque dinero del banco), regístrelo aquí para que los dos saldos coincidan con la realidad.'
        },
        {
            objetivo: '.panel-tabla',
            titulo: 'El historial',
            texto: 'Cada depósito o retiro, con quién lo registró. Si hubo un error, se anula y el dinero vuelve a su lugar.'
        }
    ],
    '/reporte': () => [
        {
            objetivo: '.selector-mes',
            titulo: 'Elija el mes',
            texto: 'El reporte muestra con cuánto empezó el condominio, qué entró, qué salió y con cuánto terminó.'
        },
        {
            objetivo: '.encabezado-acciones .btn-primary',
            titulo: 'Imprimir o guardar en PDF',
            texto: 'Para presentar las cuentas del mes a los propietarios.'
        },
        {
            objetivo: '.reporte-cabecera',
            titulo: 'La rendición de cuentas',
            texto: 'Más abajo: los ingresos y gastos por tipo, el detalle de cada gasto, la cobranza del mes y los departamentos en mora.'
        }
    ],
    '/departamento': () => [
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Registrar un departamento',
            texto: 'Cada departamento tiene un tipo, y el tipo define cuánto paga de expensa cada mes.'
        },
        {
            objetivo: '.panel-tabla',
            titulo: 'La ficha de cada departamento',
            texto: 'Haga clic en el número para ver su estado de cuenta, sus pagos, quién vive y el historial de dueños.'
        },
        {
            objetivo: '.resumen',
            titulo: 'El conjunto',
            texto: 'Cuántos departamentos hay, cuántos están desocupados, cuánto suman las expensas y la deuda total.'
        }
    ],
    '/departamento/ficha': () => [
        {
            objetivo: '.ficha-cabecera',
            titulo: 'Todo sobre este departamento',
            texto: 'Desde aquí puede imprimir su estado de cuenta o registrar un pago.'
        },
        {
            objetivo: '[data-guia="traspasar"]',
            titulo: 'Si se vende el departamento',
            texto: 'La deuda pertenece al departamento, no a la persona: al registrar el traspaso, el nuevo dueño asume lo que se debe.'
        },
        {
            objetivo: '.pestanas',
            titulo: 'Su historia completa',
            texto: 'Estado de cuenta, pagos, residentes e historial de propietarios.'
        }
    ],
    '/residente': () => [
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Quién vive en cada departamento',
            texto: 'Asigne a cada departamento su propietario y, si los hay, inquilinos o familiares.'
        },
        {
            objetivo: '[data-guia="traspaso"]',
            titulo: 'Cuando cambia el dueño',
            texto: 'Use el traspaso: deja el historial y pasa la deuda pendiente al nuevo propietario.'
        }
    ],
    '/persona': () => [
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Propietarios, inquilinos y familiares',
            texto: 'Regístrelos con su CI o NIT: sale en los recibos. Después se asignan a su departamento en Residentes.'
        },
        {
            objetivo: '.tabla-herramientas',
            titulo: 'Encontrar a alguien',
            texto: 'Busque por nombre, CI, teléfono o correo.'
        }
    ],
    '/condominio': () => [
        {
            objetivo: '.panel-tabla',
            titulo: 'Todos sus condominios',
            texto: 'Compare cuánto dinero tiene, cuánto falta cobrar y la mora de cada uno. «Administrar» lo elige para trabajar en él.'
        },
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Agregar un condominio',
            texto: 'Puede copiar los tipos de departamento y sus cuotas del condominio actual.'
        }
    ],
    '/configuracion': () => [
        {
            objetivo: '.pestanas',
            titulo: 'La configuración del condominio',
            texto: 'Sus datos (salen en los recibos), los tipos de departamento con su cuota y los tipos de ingreso y de gasto.'
        },
        {
            objetivo: '[name="dia_vencimiento"]',
            titulo: 'El día de vencimiento',
            texto: 'Después de ese día del mes, una expensa impaga pasa a estar en mora.'
        }
    ],
    '/usuario': () => [
        {
            objetivo: '[data-guia="accion-principal"]',
            titulo: 'Quién usa el sistema',
            texto: 'Cree un usuario para cada persona. Al tesorero se le asignan los condominios que puede ver.'
        },
        {
            objetivo: '.panel-tabla',
            titulo: 'Desactivar en lugar de borrar',
            texto: 'Quien ya registró pagos o gastos no se elimina: se desactiva y deja de poder ingresar.'
        }
    ],
    '/cargo/avisos': () => [
        {
            objetivo: '.comprobante-acciones',
            titulo: 'Un aviso por departamento',
            texto: 'Puede limitarlo a los departamentos con deuda vencida. Al imprimir, cada aviso sale en su propia hoja.'
        }
    ]
};

// Pasos de la guía de una pantalla (lista vacía si no tiene guía)
export function guiaDe(ruta, usuario) {
    return GUIAS[ruta] ? GUIAS[ruta](usuario) : [];
}

export function tieneGuia(ruta) {
    return Boolean(GUIAS[ruta]);
}
