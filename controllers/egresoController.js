const egresoModel = require('../models/egresoModel');

// Métodos de pago permitidos
const METODOS_PAGO = ['efectivo', 'transferencia', 'QR'];

// Revisa que los datos del formulario sean correctos, devuelve el mensaje de error o null
function validarEgreso(data) {
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
    if (!Number.isInteger(data.id_tipo_egreso)) {
        return 'Debe elegir un tipo de egreso';
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
    if (error.constraint == 'egreso_id_tipo_egreso_fkey') {
        return 'El tipo de egreso elegido no existe';
    }
    if (error.code == '22007' || error.code == '22008') {
        return 'La fecha no es válida';
    }
    if (error.code == '22003') {
        return 'El monto es demasiado grande';
    }
    return error.message;
}

// Devuelve la lista de egresos
async function obtenerEgresos(req, res) {
    try {
        let data = await egresoModel.obtenerEgresos();
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Devuelve un egreso por su id
async function obtenerEgreso(req, res) {
    let id_egreso = req.params.id;
    try {
        let data = await egresoModel.obtenerEgreso(id_egreso);
        if (!data) {
            return res.json({ "Success": false, "Mensaje": 'El egreso no existe' });
        }
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Registra un egreso nuevo
async function guardarEgreso(req, res) {
    let body = req.body || {};
    let data = {
        concepto: body.concepto,
        monto: parseFloat(body.monto),
        fecha: body.fecha,
        estado: body.estado,
        id_tipo_egreso: parseInt(body.id_tipo_egreso),
        metodo_pago: body.metodo_pago
    };
    let error = validarEgreso(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        let nuevo = await egresoModel.guardarEgreso(data);
        return res.json({ "Success": true, "Data": nuevo.id_egreso });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Modifica un egreso existente
async function actualizarEgreso(req, res) {
    let id_egreso = req.params.id;
    let body = req.body || {};
    let data = {
        id_egreso: id_egreso,
        concepto: body.concepto,
        monto: parseFloat(body.monto),
        fecha: body.fecha,
        estado: body.estado,
        id_tipo_egreso: parseInt(body.id_tipo_egreso),
        metodo_pago: body.metodo_pago
    };
    let error = validarEgreso(data);
    if (error) {
        return res.json({ "Success": false, "Mensaje": error });
    }
    try {
        await egresoModel.actualizarEgreso(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

// Elimina un egreso
async function eliminarEgreso(req, res) {
    let id_egreso = req.params.id;
    let data = { id_egreso: id_egreso };
    try {
        await egresoModel.eliminarEgreso(data);
        return res.json({ "Success": true });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": mensajeError(error) });
    }
}

module.exports = {
    obtenerEgresos,
    obtenerEgreso,
    guardarEgreso,
    actualizarEgreso,
    eliminarEgreso
};
