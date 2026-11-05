// Un departamento está disponible si está activo y no tiene residentes activos
export function estaDisponible(departamento) {
    return departamento.estado === 'activo' && Number(departamento.residentes_activos) === 0;
}

// 'disponible' | 'ocupado' | null (inactivo)
export function ocupacion(departamento) {
    if (departamento.estado !== 'activo') {
        return null;
    }
    return estaDisponible(departamento) ? 'disponible' : 'ocupado';
}

export function enlaceFicha(idDepartamento) {
    return '/departamento/ficha?id=' + idDepartamento;
}
