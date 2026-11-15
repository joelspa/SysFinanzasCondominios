const dao = require('./dao');
const { cifrar } = require('../utils/contrasena');
const objDao = new dao();

// Nunca se devuelve password_hash: la contraseña no sale del servidor.
//   movimientos: pagos, gastos y traspasos que registró o anuló (si tiene, no se puede eliminar)
//   condominios: ids de los condominios asignados (solo importa en el tesorero; el administrador ve todos)
const SQL_USUARIOS = 'SELECT u.id_usuario, u.nombre, u.correo, u.rol, u.activo, '
    + '((SELECT COUNT(*) FROM ingreso i WHERE u.id_usuario IN (i.id_usuario, i.anulado_por)) '
    + '+ (SELECT COUNT(*) FROM egreso e WHERE u.id_usuario IN (e.id_usuario, e.anulado_por)) '
    + '+ (SELECT COUNT(*) FROM traspaso tr WHERE tr.id_usuario = u.id_usuario))::int AS movimientos, '
    + 'ARRAY(SELECT uc.id_condominio FROM usuario_condominio uc WHERE uc.id_usuario = u.id_usuario ORDER BY uc.id_condominio) AS condominios '
    + 'FROM usuario u ';

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

// Deja al usuario con los condominios indicados. Al administrador no se le guarda ninguno: ve todos.
async function asignarCondominios(t, idUsuario, data) {
    await t.none('DELETE FROM usuario_condominio WHERE id_usuario = $1', [idUsuario]);
    if (data.rol === 'tesorero') {
        await t.none('INSERT INTO usuario_condominio (id_usuario, id_condominio) SELECT $1, UNNEST($2::int[])',
            [idUsuario, data.condominios]);
    }
}

class usuarioModel {
    constructor() { }

    ObtenerUsuarios() {
        return objDao.consultar(SQL_USUARIOS + 'ORDER BY u.activo DESC, u.nombre');
    }

    // Para el inicio de sesión: es la única consulta que lee password_hash (se compara en el servidor)
    ObtenerPorCorreo(correo) {
        let sql = 'SELECT id_usuario, nombre, correo, rol, activo, password_hash FROM usuario WHERE LOWER(correo) = LOWER($1)';
        return objDao.obtenerUno(sql, [correo]);
    }

    // Usuario de una sesión abierta; devuelve null si ya no existe o lo desactivaron
    ObtenerActivo(idUsuario) {
        return objDao.obtenerUno('SELECT id_usuario, nombre, correo, rol FROM usuario WHERE id_usuario = $1 AND activo', [idUsuario]);
    }

    async CambiarContrasena(idUsuario, contrasena) {
        return objDao.ejecutar('UPDATE usuario SET password_hash = $1 WHERE id_usuario = $2', [await cifrar(contrasena), idUsuario]);
    }

    // Transacción: crea el usuario y le asigna sus condominios
    async GuardarUsuario(data) {
        let sql = 'INSERT INTO usuario (nombre, correo, password_hash, rol, activo) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario';
        let params = [data.nombre, data.correo, await cifrar(data.contrasena), data.rol, data.activo];
        return objDao.transaccion(async function (t) {
            let nuevo = await t.one(sql, params);
            await asignarCondominios(t, nuevo.id_usuario, data);
            return nuevo;
        });
    }

    // Transacción: actualiza los datos, sus condominios y, solo si se escribió una nueva, la contraseña
    async ActualizarUsuario(data) {
        let hash = data.contrasena ? await cifrar(data.contrasena) : null;
        return objDao.transaccion(async function (t) {
            await validarAdministradores(t, data.id_usuario, data.rol === 'admin' && data.activo === true);
            await t.none('UPDATE usuario SET nombre = $1, correo = $2, rol = $3, activo = $4 WHERE id_usuario = $5',
                [data.nombre, data.correo, data.rol, data.activo, data.id_usuario]);
            await asignarCondominios(t, data.id_usuario, data);
            if (hash) {
                await t.none('UPDATE usuario SET password_hash = $1 WHERE id_usuario = $2', [hash, data.id_usuario]);
            }
        });
    }

    // Un usuario que registró o anuló pagos, gastos o traspasos no se elimina (es parte del historial): se desactiva
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
