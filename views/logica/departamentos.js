// Un departamento está desocupado si está activo y no tiene residentes activos.
// Desocupado no es «libre de pagar»: su expensa se sigue emitiendo a nombre del propietario.
export function estaDesocupado(departamento) {
    return departamento.estado === 'activo' && Number(departamento.residentes_activos) === 0;
}

// 'desocupado' | 'ocupado' | null (inactivo)
export function ocupacion(departamento) {
    if (departamento.estado !== 'activo') {
        return null;
    }
    return estaDesocupado(departamento) ? 'desocupado' : 'ocupado';
}

export function enlaceFicha(idDepartamento) {
    return '/departamento/ficha?id=' + idDepartamento;
}

// Abre Ingresos con el formulario de pago listo para ese departamento
export function enlaceCobro(idDepartamento) {
    return '/ingreso?departamento=' + idDepartamento;
}
