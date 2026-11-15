// Funciones para mostrar montos, fechas y textos de la misma forma en todas las páginas

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const numero = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compacto = new Intl.NumberFormat('es-BO', { notation: 'compact', maximumFractionDigits: 1 });

// 1250.5 -> 'Bs 1250,50'
export function dinero(valor) {
    return 'Bs ' + numero.format(Number(valor) || 0);
}

// -280 -> '−Bs 280,00': una pérdida o un saldo negativo se lee como tal sin depender del color
export function dineroConSigno(valor) {
    return (Number(valor) < 0 ? '−' : '') + dinero(Math.abs(Number(valor) || 0));
}

// 1250.5 -> 'Bs 1,3 mil' (para ejes de gráficos)
export function dineroCorto(valor) {
    return 'Bs ' + compacto.format(Number(valor) || 0);
}

export function decimal(valor) {
    return numero.format(Number(valor) || 0);
}

// '2025-01-15' -> '15 ene 2025'
export function formatoFecha(texto) {
    if (!texto) {
        return '—';
    }
    let [anio, mes, dia] = texto.split('-');
    return Number(dia) + ' ' + MESES[mes - 1] + ' ' + anio;
}

// Fecha de hoy en formato 'YYYY-MM-DD' (hora local)
export function hoy() {
    return new Date().toLocaleDateString('en-CA');
}

// Mes actual en formato 'YYYY-MM'
export function mesActual() {
    return hoy().slice(0, 7);
}

// 'Jueves, 30 de octubre de 2026'
export function fechaLarga() {
    let texto = new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return capitalizar(texto);
}

// Los meses se manejan como 'YYYY-MM': desplazarMes('2026-01', -1) -> '2025-12'
export function desplazarMes(clave, cantidad) {
    let [anio, mes] = clave.split('-').map(Number);
    let fecha = new Date(anio, mes - 1 + cantidad, 1);
    return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
}

export function mesCorto(clave) {
    return MESES[Number(clave.slice(5, 7)) - 1];
}

// '2026-11' -> 'Nov 2026' (para columnas de tabla, donde el nombre completo del mes ocupa demasiado)
export function mesAbreviado(clave) {
    return capitalizar(mesCorto(clave)) + ' ' + clave.slice(0, 4);
}

export function mesLargo(clave) {
    return MESES_LARGOS[Number(clave.slice(5, 7)) - 1] + ' ' + clave.slice(0, 4);
}

// cantidad(1, 'cargo vencido', 'cargos vencidos') -> '1 cargo vencido'
export function cantidad(numero, singular, plural) {
    return numero + ' ' + (numero === 1 ? singular : plural);
}

// 'Ana Pérez' -> 'AP'
export function iniciales(nombre) {
    return String(nombre || '').trim().split(/\s+/).slice(0, 2)
        .map((palabra) => palabra.charAt(0)).join('').toUpperCase();
}

export function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

// Línea de contacto del condominio: 'NIT 123 · Tel. 700 · correo@condominio.com' (omite los vacíos)
export function contactoCondominio(condominio) {
    return [condominio.nit && 'NIT ' + condominio.nit, condominio.telefono && 'Tel. ' + condominio.telefono, condominio.correo]
        .filter(Boolean).join(' · ');
}

// Suma un campo numérico de una lista de registros
export function sumar(lista, campo = 'monto') {
    return lista.reduce((suma, registro) => suma + Number(registro[campo]), 0);
}

// Quita mayúsculas y tildes para que la búsqueda de 'perez' encuentre 'Pérez'
function normalizar(texto) {
    return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// true si alguno de los campos contiene el texto buscado
export function coincide(busqueda, ...campos) {
    let buscado = normalizar(busqueda).trim();
    return buscado === '' || campos.some((campo) => normalizar(campo).includes(buscado));
}

// ===== Recibos =====

// 12 -> '000012' (número de recibo o de comprobante de gasto)
export function numeroRecibo(numero) {
    return String(numero).padStart(6, '0');
}

// Texto de un movimiento anulado: 'Cheque rechazado · Anulado por Ana Pérez el 14 nov 2026'
export function textoAnulacion(movimiento) {
    let quien = movimiento.anulado_por ? ' · Anulado por ' + movimiento.anulado_por + ' el ' + formatoFecha(movimiento.fecha_anulacion) : '';
    return movimiento.motivo_anulacion + quien;
}

const HASTA_29 = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece',
    'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
    'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos',
    'ochocientos', 'novecientos'];

// Un número de 0 a 999 en palabras: 345 -> 'trescientos cuarenta y cinco'
function hasta999EnLetras(n) {
    if (n === 100) {
        return 'cien';
    }
    let resto = n % 100;
    let decenas = resto < 30 ? HASTA_29[resto] : DECENAS[Math.floor(resto / 10)] + (resto % 10 > 0 ? ' y ' + HASTA_29[resto % 10] : '');
    return [CENTENAS[Math.floor(n / 100)], decenas].filter(Boolean).join(' ');
}

// Delante de «mil» o «millones», «uno» se dice «un»: veintiún mil, treinta y un millones
function antesDeMil(texto) {
    return texto.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
}

// Un entero menor a mil millones en palabras
function enteroEnLetras(n) {
    if (n === 0) {
        return 'cero';
    }
    let millones = Math.floor(n / 1000000);
    let miles = Math.floor(n % 1000000 / 1000);
    let resto = n % 1000;
    let partes = [];
    if (millones > 0) {
        partes.push(millones === 1 ? 'un millón' : antesDeMil(hasta999EnLetras(millones)) + ' millones');
    }
    if (miles > 0) {
        partes.push(miles === 1 ? 'mil' : antesDeMil(hasta999EnLetras(miles)) + ' mil');
    }
    if (resto > 0) {
        partes.push(hasta999EnLetras(resto));
    }
    return partes.join(' ');
}

// El monto como se escribe en un recibo: 1250.5 -> 'Mil doscientos cincuenta 50/100 bolivianos'
export function montoEnLetras(valor) {
    let centavos = Math.round((Number(valor) || 0) * 100);
    let entero = Math.floor(centavos / 100);
    if (entero >= 1000000000) {
        return dinero(valor);
    }
    return capitalizar(enteroEnLetras(entero)) + ' ' + String(centavos % 100).padStart(2, '0') + '/100 bolivianos';
}
