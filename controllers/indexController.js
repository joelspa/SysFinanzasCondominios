const path = require('node:path');

function get(req, res) {
    if (req.params.id && !/^[1-9]\d*$/.test(req.params.id)) {
        return res.status(404).send('Página no encontrada');
    }
    res.sendFile(path.join(__dirname, '../views/index.html'));
}

module.exports = { get };
