// Funciones para comunicarse con la API de Express

// Hace la petición y devuelve la respuesta estándar { Success, Data, Mensaje }
async function pedir(url, opciones) {
    try {
        let respuesta = await fetch(url, opciones);
        return await respuesta.json();
    } catch {
        return { Success: false, Mensaje: 'No se pudo conectar con el servidor' };
    }
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
