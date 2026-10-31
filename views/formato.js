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

export function mesLargo(clave) {
    return MESES_LARGOS[Number(clave.slice(5, 7)) - 1] + ' ' + clave.slice(0, 4);
}

// 'Ana Pérez' -> 'AP'
export function iniciales(nombre) {
    return String(nombre || '').trim().split(/\s+/).slice(0, 2)
        .map((palabra) => palabra.charAt(0)).join('').toUpperCase();
}

export function capitalizar(texto) {
    return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
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
