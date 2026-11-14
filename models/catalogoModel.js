const dao = require('./dao');
const objDao = new dao();

// Modelo genérico para los catálogos de config/catalogos.js.
// Un catálogo marcado con porCondominio (los tipos de departamento) guarda y muestra solo las filas
// del condominio activo; los demás (tipos de ingreso y de gasto) son comunes a todos los condominios.
class catalogoModel {
    constructor(config) {
        this.config = config;
    }

    // Devuelve las filas del catálogo con cuántos registros usan cada una
    Obtener(idCondominio) {
        let { tabla, id, uso, porCondominio } = this.config;
        let sql = `SELECT t.*, (${uso})::int AS uso FROM ${tabla} t `;
        if (porCondominio) {
            return objDao.consultar(sql + `WHERE t.id_condominio = $1 ORDER BY t.${id}`, [idCondominio]);
        }
        return objDao.consultar(sql + `ORDER BY t.${id}`);
    }

    Guardar(idCondominio, data) {
        let { tabla, id, porCondominio } = this.config;
        let campos = [...this.config.campos];
        let valores = campos.map((campo) => data[campo]);
        if (porCondominio) {
            campos.push('id_condominio');
            valores.push(idCondominio);
        }
        let marcas = campos.map((_, i) => '$' + (i + 1)).join(', ');
        let sql = `INSERT INTO ${tabla} (${campos.join(', ')}) VALUES (${marcas}) RETURNING ${id}`;
        return objDao.insertar(sql, valores);
    }

    Actualizar(idCondominio, data) {
        let { tabla, id, campos } = this.config;
        let asignaciones = campos.map((campo, i) => `${campo} = $${i + 1}`).join(', ');
        let fila = this.filaDe(idCondominio, data[id], campos.length + 1);
        let sql = `UPDATE ${tabla} t SET ${asignaciones} WHERE ${fila.donde}`;
        return objDao.ejecutar(sql, [...campos.map((campo) => data[campo]), ...fila.params]);
    }

    // Una fila en uso no se elimina: dejaría registros sin su tipo
    async Eliminar(idCondominio, data) {
        let { tabla, id, uso, usadoPor } = this.config;
        let fila = this.filaDe(idCondominio, data[id], 1);
        let actual = await objDao.obtenerUno(`SELECT (${uso})::int AS uso FROM ${tabla} t WHERE ${fila.donde}`, fila.params);
        if (actual && actual.uso > 0) {
            let registros = actual.uso === 1 ? usadoPor[0] : usadoPor[1];
            throw new Error(`No se puede eliminar: lo usa${actual.uso === 1 ? "" : "n"} ${actual.uso} ${registros}. Puede cambiarle el nombre o la descripción`);
        }
        return objDao.ejecutar(`DELETE FROM ${tabla} t WHERE ${fila.donde}`, fila.params);
    }

    // Condición (y sus parámetros, desde $n) para llegar a una fila por su id. Si el catálogo es
    // por condominio, la fila además tiene que ser del condominio activo.
    filaDe(idCondominio, idFila, n) {
        let { id, porCondominio } = this.config;
        if (porCondominio) {
            return { donde: `t.${id} = $${n} AND t.id_condominio = $${n + 1}`, params: [idFila, idCondominio] };
        }
        return { donde: `t.${id} = $${n}`, params: [idFila] };
    }
}

module.exports = catalogoModel;
