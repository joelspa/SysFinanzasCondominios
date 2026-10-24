const ingresoModel = require('../models/ingresoModel');

// Métodos de pago permitidos
const METODOS_PAGO = ['efectivo', 'transferencia', 'QR'];

// Revisa que los datos del formulario sean correctos, devuelve el mensaje de error o null
function validarIngreso(data) {
    if (!Number.isInteger(data.id_departamento)) {
        return 'Debe elegir un departamento';
    }
    if (!Number.isInteger(data.id_tipo_ingreso)) {
        return 'Debe elegir un tipo de ingreso';
    }
    if (!data.concepto || data.concepto.trim() == '') {
        return 'El concepto es obligatorio';
    }
    if (data.concepto.length > 180) {
        return 'El concepto no puede tener más de 180 caracteres';
    }
    if (isNaN(data.monto) || data.monto <= 0) {
        return 'El monto debe ser mayor que 0';
    }
    if (!data.fecha) {
        return 'La fecha es obligatoria';
    }
    if (!METODOS_PAGO.includes(data.metodo_pago)) {
        return 'Debe elegir un método de pago';
    }
    if (data.estado != 'registrado' && data.estado != 'anulado') {
        return 'El estado debe ser registrado o anulado';
    }
    return null;
}

// Traduce los errores de PostgreSQL a un mensaje entendible
function mensajeError(error) {
    if (error.constraint == 'ingreso_id_departamento_fkey') {
        return 'El departamento elegido no existe';
    }
    if (error.constraint == 'ingreso_id_tipo_ingreso_fkey') {
        return 'El tipo de ingreso elegido no existe';
    }
    if (error.code == '22007' || error.code == '22008') {
        return 'La fecha no es válida';
    }
    if (error.code == '22003') {
        return 'El monto es demasiado grande';
    }
    return error.message;
}

// Devuelve la lista de ingresos
async function obtenerIngresos(req, res) {
    try {
        let data = await ingresoModel.obtenerIngresos();
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Devuelve un ingreso por su id
async function obtenerIngreso(req, res) {
    let id_ingreso = req.params.id;
    try {
        let data = await ingresoModel.obtenerIngreso(id_ingreso);
        if (!data) {
            return res.json({ "Success": false, "Mensaje": 'El ingreso no existe' });
        }
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Registra un ingreso nuevo
async function guardarIngreso(req, res) {
    let body = req.body || {};
    let data = {
        id_departamento: parseInt(body.id_departamento),
        id_tipo_ingreso: parseInt(body.id_tipo_ingreso),
        concepto: body.concepto,
        monto: parseFloat(body.monto),
        fecha: body.fecha,
        metodo_pago: body.metodo_pago,
        estado: body.estado
    };
    let error = validarIngreso(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        let nuevo = await ingresoModel.guardarIngreso(data);
        return res.json({ "Success": true, "Data": nuevo.id_ingreso });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Modifica un ingreso existente
async function actualizarIngreso(req, res) {
    let id_ingreso = req.params.id;
    let body = req.body || {};
    let data = {
        id_ingreso: id_ingreso,
        id_departamento: parseInt(body.id_departamento),
        id_tipo_ingreso: parseInt(body.id_tipo_ingreso),
        concepto: body.concepto,
        monto: parseFloat(body.monto),
        fecha: body.fecha,
        metodo_pago: body.metodo_pago,
        estado: body.estado
    };
    let error = validarIngreso(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        await ingresoModel.actualizarIngreso(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Elimina un ingreso
async function eliminarIngreso(req, res) {
    let id_ingreso = req.params.id;
    let data = { id_ingreso: id_ingreso };
    try {
        await ingresoModel.eliminarIngreso(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

module.exports = {
    obtenerIngresos,
    obtenerIngreso,
    guardarIngreso,
    actualizarIngreso,
    eliminarIngreso
};
