const db = require('./db');

// Acceso a datos: todos los modelos ejecutan sus consultas a través de esta clase
class dao {
    constructor() { }
    async consultar(sql, params = []) {
        let data = await db.any(sql, params);
        return data;
    }
    async insertar(sql, params = []) {
        let data = await db.one(sql, params);
        return data;
    }
    async ejecutar(sql, params = []) {
        let data = await db.none(sql, params);
        return data;
    }
    // Ejecuta varias consultas como una sola transacción: si una falla se deshacen todas (ROLLBACK)
    async transaccion(operaciones) {
        let data = await db.tx(operaciones);
        return data;
    }
}

module.exports = dao;
