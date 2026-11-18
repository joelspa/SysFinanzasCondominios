// Valores fijos de los formularios y filtros (deben coincidir con los CHECK de database/schema.sql)

export const ESTADOS_REGISTRO = [
    { valor: 'activo', texto: 'Activo' },
    { valor: 'inactivo', texto: 'Inactivo' }
];

export const OCUPACION = [
    { valor: 'desocupado', texto: 'Desocupados' },
    { valor: 'ocupado', texto: 'Ocupados' }
];

export const RELACIONES = [
    { valor: 'propietario', texto: 'Propietario' },
    { valor: 'inquilino', texto: 'Inquilino' },
    { valor: 'familiar', texto: 'Familiar' }
];

// Estados de un pago o un gasto
export const ESTADOS_MOVIMIENTO = [
    { valor: 'registrado', texto: 'Registrado' },
    { valor: 'anulado', texto: 'Anulado' }
];

// Estados calculados en la vista v_cargo
export const ESTADOS_CARGO = [
    { valor: 'pendiente', texto: 'Pendiente' },
    { valor: 'parcial', texto: 'Parcial' },
    { valor: 'vencido', texto: 'Vencido' },
    { valor: 'pagado', texto: 'Pagado' }
];

export const METODOS_PAGO = [
    { valor: 'efectivo', texto: 'Efectivo' },
    { valor: 'transferencia', texto: 'Transferencia' },
    { valor: 'QR', texto: 'QR' },
    { valor: 'tarjeta', texto: 'Tarjeta' }
];

// Lo cobrado o pagado en efectivo está en la caja; con los demás métodos, en el banco (services/caja.js)
export const METODO_EFECTIVO = 'efectivo';

// Movimientos de dinero entre la caja y el banco (CHECK de la tabla movimiento_caja)
export const SENTIDOS_CAJA = [
    { valor: 'caja_a_banco', texto: 'Depósito: de la caja al banco', corto: 'Depósito al banco', origen: 'efectivo' },
    { valor: 'banco_a_caja', texto: 'Retiro: del banco a la caja', corto: 'Retiro del banco', origen: 'banco' }
];

export const CONCEPTO_EXPENSAS = 'Expensas';  // igual que config/config.js

// Sugerencias para el concepto de un cargo manual
export const CONCEPTOS_CARGO = [CONCEPTO_EXPENSAS, 'Multa', 'Cuota extraordinaria', 'Reparación', 'Consumo de agua'];

export const MAX_MESES_ADELANTO = 24;  // igual que config/config.js

// Roles de usuario (CHECK de la tabla usuario)
export const ROLES = [
    { valor: 'admin', texto: 'Administrador', descripcion: 'Acceso completo, incluida la configuración y los usuarios.' },
    { valor: 'tesorero', texto: 'Tesorero', descripcion: 'Registra pagos, gastos y cargos.' }
];

// 'tesorero' -> 'Tesorero'
export function textoRol(rol) {
    return (ROLES.find((r) => r.valor === rol) || { texto: rol }).texto;
}

// Páginas que solo ve el administrador (el servidor también lo exige: middlewares/sesion.js)
export const RUTAS_ADMIN = ['/configuracion', '/usuario'];

export const LARGO_MINIMO_CONTRASENA = 8;   // igual que utils/contrasena.js
