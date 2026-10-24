const tipoIngresoModel = require('../models/tipoIngresoModel');

// Devuelve la lista de tipos de ingreso
async function obtenerTiposIngreso(req, res) {
    try {
        let data = await tipoIngresoModel.obtenerTiposIngreso();
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": error.message });
    }
}

module.exports = {
    obtenerTiposIngreso
};
