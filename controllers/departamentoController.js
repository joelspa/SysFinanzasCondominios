const departamentoModel = require('../models/departamentoModel');

// Revisa que los datos del formulario sean correctos, devuelve el mensaje de error o null
function validarDepartamento(data) {
    if (!data.numero || data.numero.trim() == '') {
        return 'El número es obligatorio';
    }
    if (data.numero.length > 15) {
        return 'El número no puede tener más de 15 caracteres';
    }
    if (!Number.isInteger(data.piso)) {
        return 'El piso debe ser un número entero';
    }
    if (data.estado != 'activo' && data.estado != 'inactivo') {
        return 'El estado debe ser activo o inactivo';
    }
    if (!Number.isInteger(data.id_tipo_departamento)) {
        return 'Debe elegir un tipo de departamento';
    }
    // DECIMAL(8,2) admite hasta 999999.99
    if (isNaN(data.metros_cuadrados) || data.metros_cuadrados <= 0 || data.metros_cuadrados >= 1000000) {
        return 'Los metros cuadrados deben ser un número mayor a 0';
    }
    return null;
}

// Traduce los errores de PostgreSQL a un mensaje entendible
function mensajeError(error) {
    if (error.code == '23505') {
        return 'Ya existe un departamento con ese número';
    }
    if (error.constraint == 'departamento_id_tipo_departamento_fkey') {
        return 'El tipo de departamento elegido no existe';
    }
    if (error.code == '23503') {
        return 'No se puede eliminar, el departamento tiene registros asociados';
    }
    return error.message;
}

// Devuelve la lista de departamentos
async function obtenerDepartamentos(req, res) {
    try {
        let data = await departamentoModel.obtenerDepartamentos();
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Devuelve un departamento por su id
async function obtenerDepartamento(req, res) {
    let id_departamento = req.params.id;
    try {
        let data = await departamentoModel.obtenerDepartamento(id_departamento);
        if (!data) {
            return res.json({ "Success": false, "Mensaje": 'El departamento no existe' });
        }
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Crea un departamento nuevo
async function guardarDepartamento(req, res) {
    let body = req.body || {};
    let data = {
        numero: body.numero,
        piso: parseInt(body.piso),
        estado: body.estado,
        id_tipo_departamento: parseInt(body.id_tipo_departamento),
        metros_cuadrados: parseFloat(body.metros_cuadrados)
    };
    let error = validarDepartamento(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        let nuevo = await departamentoModel.guardarDepartamento(data);
        return res.json({ "Success": true, "Data": nuevo.id_departamento });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Modifica un departamento existente
async function actualizarDepartamento(req, res) {
    let id_departamento = req.params.id;
    let body = req.body || {};
    let data = {
        id_departamento: id_departamento,
        numero: body.numero,
        piso: parseInt(body.piso),
        estado: body.estado,
        id_tipo_departamento: parseInt(body.id_tipo_departamento),
        metros_cuadrados: parseFloat(body.metros_cuadrados)
    };
    let error = validarDepartamento(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        await departamentoModel.actualizarDepartamento(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Elimina un departamento
async function eliminarDepartamento(req, res) {
    let id_departamento = req.params.id;
    let data = { id_departamento: id_departamento };
    try {
        await departamentoModel.eliminarDepartamento(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

module.exports = {
    obtenerDepartamentos,
    obtenerDepartamento,
    guardarDepartamento,
    actualizarDepartamento,
    eliminarDepartamento
};
