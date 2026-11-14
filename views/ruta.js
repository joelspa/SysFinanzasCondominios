// Lee un parámetro de la dirección actual: /departamento/ficha?id=3 -> parametro('id') = '3'
export function parametro(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
}
