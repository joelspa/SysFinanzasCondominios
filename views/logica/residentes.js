import { formatoFecha } from '../formato';

// Un propietario activo no tiene fecha de salida: deja de serlo solo con un traspaso de propiedad
// (misma regla que models/residenteModel.js)
export function puedeTenerSalida(residente) {
    return !(residente.tipo_relacion === 'propietario' && residente.estado === 'activo');
}

// Otros propietarios activos del departamento del formulario (sin contar al que se está editando).
// Si hay alguno y se registra otro propietario, hay que confirmar copropiedad o hacer un traspaso
// (misma regla que models/residenteModel.js)
export function otrosPropietarios(residentes, formulario) {
    if (formulario.tipo_relacion !== 'propietario' || formulario.estado !== 'activo') {
        return [];
    }
    return residentes.filter((r) => r.id_departamento == formulario.id_departamento
        && r.tipo_relacion === 'propietario' && r.estado === 'activo'
        && r.id_residente != formulario.id_residente && r.id_persona != formulario.id_persona);
}

// Texto que acompaña a "Desde ..." en las tablas
export function textoSalida(residente) {
    if (residente.fecha_fin) {
        return 'Hasta ' + formatoFecha(residente.fecha_fin);
    }
    return puedeTenerSalida(residente) ? 'Sin fecha de salida' : 'Propiedad vigente';
}
