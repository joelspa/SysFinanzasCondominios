const personaModel = require('../models/personaModel');

// Revisa que los datos del formulario sean correctos, devuelve el mensaje de error o null
function validarPersona(data) {
    if (!data.nombre || data.nombre.trim() == '') {
        return 'El nombre es obligatorio';
    }
    if (data.nombre.length > 120) {
        return 'El nombre no puede tener más de 120 caracteres';
    }
    if (data.telefono && data.telefono.length > 25) {
        return 'El teléfono no puede tener más de 25 caracteres';
    }
    if (data.correo && data.correo.length > 120) {
        return 'El correo no puede tener más de 120 caracteres';
    }
    if (data.correo && !data.correo.includes('@')) {
        return 'El correo no es válido';
    }
    return null;
}

// Traduce los errores de PostgreSQL a un mensaje entendible
function mensajeError(error) {
    if (error.code == '23503') {
        return 'No se puede eliminar, la persona está asignada a un departamento';
    }
    return error.message;
}

// Devuelve la lista de personas
async function obtenerPersonas(req, res) {
    try {
        let data = await personaModel.obtenerPersonas();
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Devuelve una persona por su id
async function obtenerPersona(req, res) {
    let id_persona = req.params.id;
    try {
        let data = await personaModel.obtenerPersona(id_persona);
        if (!data) {
            return res.json({ "Success": false, "Mensaje": 'La persona no existe' });
        }
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Crea una persona nueva (teléfono y correo vacíos se guardan como NULL)
async function guardarPersona(req, res) {
    let body = req.body || {};
    let data = {
        nombre: body.nombre,
        telefono: body.telefono || null,
        correo: body.correo || null
    };
    let error = validarPersona(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        let nuevo = await personaModel.guardarPersona(data);
        return res.json({ "Success": true, "Data": nuevo.id_persona });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Modifica una persona existente
async function actualizarPersona(req, res) {
    let id_persona = req.params.id;
    let body = req.body || {};
    let data = {
        id_persona: id_persona,
        nombre: body.nombre,
        telefono: body.telefono || null,
        correo: body.correo || null
    };
    let error = validarPersona(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        await personaModel.actualizarPersona(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Elimina una persona
async function eliminarPersona(req, res) {
    let id_persona = req.params.id;
    let data = { id_persona: id_persona };
    try {
        await personaModel.eliminarPersona(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

module.exports = {
    obtenerPersonas,
    obtenerPersona,
    guardarPersona,
    actualizarPersona,
    eliminarPersona
};
