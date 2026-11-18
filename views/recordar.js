// Recuerda en el navegador pequeñas preferencias de cada usuario (qué guías ya vio, qué avisos ocultó).
// Si el navegador no deja guardar (modo privado, almacenamiento bloqueado), simplemente no recuerda.
const VERSION = 'v1';

const clave = (idUsuario, nombre) => 'condominios:' + VERSION + ':' + idUsuario + ':' + nombre;

export function recordado(idUsuario, nombre) {
    try {
        return localStorage.getItem(clave(idUsuario, nombre)) === 'si';
    } catch {
        return false;
    }
}

export function recordar(idUsuario, nombre) {
    try {
        localStorage.setItem(clave(idUsuario, nombre), 'si');
    } catch {
        // Sin almacenamiento disponible: la próxima vez se vuelve a mostrar
    }
}

// true si el usuario pidió a su sistema menos movimiento en pantalla
export function prefiereMenosMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
