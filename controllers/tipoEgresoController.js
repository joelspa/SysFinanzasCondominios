const tipoEgresoModel = require('../models/tipoEgresoModel');

// Devuelve la lista de tipos de egreso
async function obtenerTiposEgreso(req, res) {
    try {
        let data = await tipoEgresoModel.obtenerTiposEgreso();
        return res.json({ "Success": true, "Data": data });
    } catch (error) {
        return res.json({ "Success": false, "Mensaje": error.message });
    }
}

module.exports = {
    obtenerTiposEgreso
};
