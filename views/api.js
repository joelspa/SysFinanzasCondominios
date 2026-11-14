// Funciones para comunicarse con la API de Express

const RUTA_INGRESO = '/login';

// Hace la petición y devuelve la respuesta estándar { Success, Data, Mensaje }
async function pedir(url, opciones) {
    let resultado;
    try {
        let respuesta = await fetch(url, opciones);
        resultado = await respuesta.json();
    } catch {
        return { Success: false, Mensaje: 'No se pudo conectar con el servidor' };
    }
    // Sin sesión (nunca ingresó o venció) se va a la pantalla de ingreso. La promesa queda sin
    // resolver porque la página se está cerrando: así no alcanza a mostrarse un error.
    if (resultado.SinSesion && window.location.pathname !== RUTA_INGRESO) {
        window.location.href = RUTA_INGRESO;
        return new Promise(() => { });
    }
    return resultado;
}

export function obtener(url) {
    return pedir(url);
}

export function enviar(url, datos) {
    return pedir(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
}

// Cambia los valores null por '' para poder mostrarlos en los inputs del formulario
export function sinNulos(registro) {
    let copia = {};
    for (let campo in registro) {
        copia[campo] = registro[campo] ?? '';
    }
    return copia;
}
