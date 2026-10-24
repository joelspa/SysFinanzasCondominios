const tipoDepartamentoModel = require('../models/tipoDepartamentoModel');

// Revisa que los datos del formulario sean correctos, devuelve el mensaje de error o null
function validarTipoDepartamento(data) {
    if (!data.nombre || data.nombre.trim() == '') {
        return 'El nombre es obligatorio';
    }
    if (data.nombre.length > 60) {
        return 'El nombre no puede tener más de 60 caracteres';
    }
    if (data.descripcion && data.descripcion.length > 200) {
        return 'La descripción no puede tener más de 200 caracteres';
    }
    if (isNaN(data.cuota_mensual) || data.cuota_mensual < 0) {
        return 'La cuota mensual debe ser un número mayor o igual a 0';
    }
    return null;
}

// Traduce los errores de PostgreSQL a un mensaje entendible
function mensajeError(error) {
    if (error.code == '23505') {
        return 'Ya existe un tipo de departamento con ese nombre';
    }
    if (error.code == '23503') {
        return 'No se puede eliminar, hay departamentos de este tipo';
    }
    return error.message;
}

// Devuelve la lista de tipos de departamento
async function obtenerTiposDepartamento(req, res) {
    try {
        let data = await tipoDepartamentoModel.obtenerTiposDepartamento();
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Devuelve un tipo de departamento por su id
async function obtenerTipoDepartamento(req, res) {
    let id_tipo_departamento = req.params.id;
    try {
        let data = await tipoDepartamentoModel.obtenerTipoDepartamento(id_tipo_departamento);
        if (!data) {
            return res.json({ "Success": false, "Mensaje": 'El tipo de departamento no existe' });
        }
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Crea un tipo de departamento nuevo (descripción vacía se guarda como NULL)
async function guardarTipoDepartamento(req, res) {
    let body = req.body || {};
    let data = {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        cuota_mensual: parseFloat(body.cuota_mensual)
    };
    let error = validarTipoDepartamento(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        let nuevo = await tipoDepartamentoModel.guardarTipoDepartamento(data);
        return res.json({ "Success": true, "Data": nuevo.id_tipo_departamento });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Modifica un tipo de departamento existente
async function actualizarTipoDepartamento(req, res) {
    let id_tipo_departamento = req.params.id;
    let body = req.body || {};
    let data = {
        id_tipo_departamento: id_tipo_departamento,
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        cuota_mensual: parseFloat(body.cuota_mensual)
    };
    let error = validarTipoDepartamento(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        await tipoDepartamentoModel.actualizarTipoDepartamento(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Elimina un tipo de departamento
async function eliminarTipoDepartamento(req, res) {
    let id_tipo_departamento = req.params.id;
    let data = { id_tipo_departamento: id_tipo_departamento };
    try {
        await tipoDepartamentoModel.eliminarTipoDepartamento(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

module.exports = {
    obtenerTiposDepartamento,
    obtenerTipoDepartamento,
    guardarTipoDepartamento,
    actualizarTipoDepartamento,
    eliminarTipoDepartamento
};
