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

// Formato de período mensual: 'YYYY-MM'
const PERIODO = /^\d{4}-(0[1-9]|1[0-2])$/;

module.exports = { responder, rechazar, leerCampos, PERIODO };
