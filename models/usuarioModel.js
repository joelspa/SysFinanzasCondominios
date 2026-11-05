const dao = require('./dao');
const { cifrar } = require('./contrasena');
const objDao = new dao();

// Nunca se devuelve password_hash: la contraseña no sale del servidor
const SQL_USUARIOS = 'SELECT u.id_usuario, u.nombre, u.correo, u.rol, u.activo, '
    + '((SELECT COUNT(*) FROM ingreso i WHERE i.id_usuario = u.id_usuario) '
    + '+ (SELECT COUNT(*) FROM egreso e WHERE e.id_usuario = u.id_usuario))::int AS movimientos FROM usuario u ';

// Siempre debe quedar al menos un administrador activo (si no, nadie podría administrar el sistema).
// Se revisa antes de que el usuario deje de ser administrador activo (por edición o eliminación).
async function validarAdministradores(t, idUsuario, sigueSiendoAdmin) {
    let actual = await t.oneOrNone('SELECT rol, activo FROM usuario WHERE id_usuario = $1', [idUsuario]);
    if (!actual || actual.rol !== 'admin' || !actual.activo || sigueSiendoAdmin) {
        return;
    }
    let { otros } = await t.one("SELECT COUNT(*)::int AS otros FROM usuario WHERE rol = 'admin' AND activo AND id_usuario <> $1",
        [idUsuario]);
    if (otros === 0) {
        throw new Error('Debe quedar al menos un administrador activo en el sistema');
    }
}

class usuarioModel {
    constructor() { }

    ObtenerUsuarios() {
        return objDao.consultar(SQL_USUARIOS + 'ORDER BY u.activo DESC, u.nombre');
    }

    async GuardarUsuario(data) {
        let sql = 'INSERT INTO usuario (nombre, correo, password_hash, rol, activo) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario';
        let params = [data.nombre, data.correo, await cifrar(data.contrasena), data.rol, data.activo];
        return objDao.insertar(sql, params);
    }

    // Transacción: actualiza los datos y, solo si se escribió una nueva, la contraseña
    async ActualizarUsuario(data) {
        let hash = data.contrasena ? await cifrar(data.contrasena) : null;
        return objDao.transaccion(async function (t) {
            await validarAdministradores(t, data.id_usuario, data.rol === 'admin' && data.activo === true);
            await t.none('UPDATE usuario SET nombre = $1, correo = $2, rol = $3, activo = $4 WHERE id_usuario = $5',
                [data.nombre, data.correo, data.rol, data.activo, data.id_usuario]);
            if (hash) {
                await t.none('UPDATE usuario SET password_hash = $1 WHERE id_usuario = $2', [hash, data.id_usuario]);
            }
        });
    }

    // Un usuario que registró pagos o gastos no se elimina (es parte del historial): se desactiva
    EliminarUsuario(data) {
        return objDao.transaccion(async function (t) {
            let usuario = await t.oneOrNone(SQL_USUARIOS + 'WHERE u.id_usuario = $1', [data.id_usuario]);
            if (!usuario) {
                return;
            }
            if (usuario.movimientos > 0) {
                throw new Error('No se puede eliminar: registró ' + usuario.movimientos + ' movimientos. Desactívelo para que ya no pueda ingresar');
            }
            await validarAdministradores(t, data.id_usuario, false);
            await t.none('DELETE FROM usuario WHERE id_usuario = $1', [data.id_usuario]);
        });
    }
}

module.exports = usuarioModel;
