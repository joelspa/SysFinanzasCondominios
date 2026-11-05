const dao = require('./dao');
const objDao = new dao();

// Modelo genérico para los catálogos de models/catalogos.js
class catalogoModel {
    constructor(config) {
        this.config = config;
    }

    // Devuelve las filas del catálogo con cuántos registros usan cada una
    Obtener() {
        let { tabla, id, uso } = this.config;
        return objDao.consultar(`SELECT t.*, (${uso})::int AS uso FROM ${tabla} t ORDER BY t.${id}`);
    }

    Guardar(data) {
        let { tabla, id, campos } = this.config;
        let marcas = campos.map((_, i) => '$' + (i + 1)).join(', ');
        let sql = `INSERT INTO ${tabla} (${campos.join(', ')}) VALUES (${marcas}) RETURNING ${id}`;
        return objDao.insertar(sql, campos.map((campo) => data[campo]));
    }

    Actualizar(data) {
        let { tabla, id, campos } = this.config;
        let asignaciones = campos.map((campo, i) => `${campo} = $${i + 1}`).join(', ');
        let sql = `UPDATE ${tabla} SET ${asignaciones} WHERE ${id} = $${campos.length + 1}`;
        return objDao.ejecutar(sql, [...campos.map((campo) => data[campo]), data[id]]);
    }

    // Una fila en uso no se elimina: dejaría registros sin su tipo
    async Eliminar(data) {
        let { tabla, id, uso, usadoPor } = this.config;
        let fila = await objDao.obtenerUno(`SELECT (${uso})::int AS uso FROM ${tabla} t WHERE t.${id} = $1`, [data[id]]);
        if (fila && fila.uso > 0) {
            let registros = fila.uso === 1 ? usadoPor[0] : usadoPor[1];
            throw new Error(`No se puede eliminar: lo usa${fila.uso === 1 ? "" : "n"} ${fila.uso} ${registros}. Puede cambiarle el nombre o la descripción`);
        }
        return objDao.ejecutar(`DELETE FROM ${tabla} WHERE ${id} = $1`, [data[id]]);
    }
}

module.exports = catalogoModel;
