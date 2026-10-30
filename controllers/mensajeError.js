// Traduce los errores de PostgreSQL a un mensaje entendible para el usuario
module.exports = function mensajeError(error) {
    switch (error.code) {
        case '23502': return 'Complete todos los campos obligatorios';
        case '23503': return 'No se puede completar, el registro está relacionado con otros datos';
        case '23505': return 'Ya existe un registro con esos datos';
        case '23514': return 'Alguno de los datos no es válido';
        case '22P02':
        case '22007':
        case '22008': return 'Alguno de los datos tiene un formato incorrecto';
        default: return error.message;
    }
};
