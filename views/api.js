// Funciones para comunicarse con la API de Express

export async function obtener(url) {
    try {
        let respuesta = await fetch(url);
        return await respuesta.json();
    } catch {
        return { Success: false, Mensaje: 'No se pudo conectar con el servidor' };
    }
}

export async function enviar(url, datos) {
    try {
        let respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        return await respuesta.json();
    } catch {
        return { Success: false, Mensaje: 'No se pudo conectar con el servidor' };
    }
}

// Cambia los valores null por '' para poder mostrarlos en los inputs del formulario
export function sinNulos(registro) {
    let copia = {};
    for (let campo in registro) {
        copia[campo] = registro[campo] ?? '';
    }
    return copia;
}
