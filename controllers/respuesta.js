const mensajeError = require('./mensajeError');

// Espera la promesa del modelo y envía la respuesta estándar de la API:
// { Success: true, Data } si salió bien o { Success: false, Mensaje } si falló
function responder(res, promesa) {
    res.type('json');
    promesa.then(function (data) {
        let respuesta = { "Success": true };
        if (data !== undefined && data !== null) {
            respuesta.Data = data;
        }
        res.send(respuesta);
    }).catch(function (error) {
        res.send({ "Success": false, "Mensaje": mensajeError(error) });
    });
}

// Responde con un error de validación sin llegar al modelo
function rechazar(res, mensaje) {
    res.type('json');
    res.send({ "Success": false, "Mensaje": mensaje });
}

// Copia del body solo los campos indicados; los vacíos quedan en null para que la BD los valide
// (a diferencia de "|| null", conserva el 0, por ejemplo piso 0 = planta baja)
function leerCampos(body, campos) {
    let data = {};
    for (let campo of campos) {
        let valor = body[campo];
        data[campo] = (valor === undefined || valor === '') ? null : valor;
    }
    return data;
}

// Motivo de una anulación sin espacios a los lados ('' si no se escribió)
function leerMotivo(body) {
    return String(body.motivo || '').trim();
}

// Formato de período mensual: 'YYYY-MM'
const PERIODO = /^\d{4}-(0[1-9]|1[0-2])$/;

// Día de vencimiento de las expensas: del 1 al 28 para que exista en todos los meses
function esDiaVencimiento(dia) {
    return Number.isInteger(dia) && dia >= 1 && dia <= 28;
}

// true si la fecha ('YYYY-MM-DD') es posterior a hoy: no se registran movimientos que aún no ocurrieron
function esFechaFutura(fecha) {
    let hoy = new Date().toLocaleDateString('en-CA');   // 'YYYY-MM-DD' en hora local
    return String(fecha) > hoy;
}

module.exports = { responder, rechazar, leerCampos, leerMotivo, PERIODO, esDiaVencimiento, esFechaFutura };
