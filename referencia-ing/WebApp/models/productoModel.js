const dao = require('./dao');
const objDao = new dao();

class productoModel {
    constructor() { }

    ObtenerProductos() {
        let sqlProductos = 'SELECT p.*, t.nombre AS tipo FROM producto p '
            + 'JOIN tipo t ON p.idtipo = t.idtipo ORDER BY p.idproducto';
        let sqlTipos = 'SELECT * FROM tipo ORDER BY idtipo';
        return Promise.all([
            objDao.consultar(sqlProductos),
            objDao.consultar(sqlTipos)
        ]).then(function (data) {
            return { Productos: data[0], Tipos: data[1] };
        });
    }

    GuardarProducto(data) {
        let sql = 'INSERT INTO Producto (Nombre, Descripcion, Precio, Cantidad, idTipo) '
            + 'VALUES ($1, $2, $3, $4, $5) RETURNING idProducto';
        let params = [data.nombre, data.descripcion, data.precio, data.cantidad, data.idtipo];
        return objDao.insertar(sql, params);
    }

    ActualizarProducto(data) {
        let sql = 'UPDATE Producto SET Nombre = $1, Descripcion = $2, Precio = $3, '
            + 'Cantidad = $4, idTipo = $5 WHERE idProducto = $6';
        let params = [data.nombre, data.descripcion, data.precio, data.cantidad,
            data.idtipo, data.idproducto];
        return objDao.ejecutar(sql, params);
    }

    EliminarProducto(data) {
        let sql = 'DELETE FROM Producto WHERE idProducto = $1';
        let params = [data.idproducto];
        return objDao.ejecutar(sql, params);
    }
}

module.exports = productoModel;
