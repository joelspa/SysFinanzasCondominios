const dao = require('./dao');
const objDao = new dao();

// Dónde aparece cada persona en el historial del condominio (residencias, traspasos y cargos a su nombre)
const SQL_HISTORIAL = '(SELECT COUNT(*) FROM residente r WHERE r.id_persona = p.id_persona)::int AS residencias, '
    + '(SELECT COUNT(*) FROM traspaso tr WHERE p.id_persona IN (tr.id_propietario_anterior, tr.id_propietario_nuevo))::int AS traspasos, '
    + '(SELECT COUNT(*) FROM cargo c WHERE c.id_responsable = p.id_persona)::int AS cargos';

class personaModel {
    constructor() { }

    // Devuelve las personas (son comunes a todos los condominios) con los departamentos del condominio
    // activo donde viven hoy y si tienen historial
    ObtenerPersonas(idCondominio) {
        let sql = 'SELECT p.*, ' + SQL_HISTORIAL + ', '
            + "(SELECT STRING_AGG(d.numero, ', ' ORDER BY d.numero) FROM residente r JOIN departamento d ON d.id_departamento = r.id_departamento "
            + "WHERE r.id_persona = p.id_persona AND r.estado = 'activo' AND d.id_condominio = $1) AS departamentos "
            + 'FROM persona p ORDER BY p.id_persona';
        return objDao.consultar(sql, [idCondominio]);
    }

    GuardarPersona(data) {
        let sql = 'INSERT INTO persona (nombre, telefono, correo) VALUES ($1, $2, $3) RETURNING id_persona';
        let params = [data.nombre, data.telefono, data.correo];
        return objDao.insertar(sql, params);
    }

    ActualizarPersona(data) {
        let sql = 'UPDATE persona SET nombre = $1, telefono = $2, correo = $3 WHERE id_persona = $4';
        let params = [data.nombre, data.telefono, data.correo, data.id_persona];
        return objDao.ejecutar(sql, params);
    }

    // Una persona con historial no se elimina: se perdería quién vivió, quién fue dueño y quién debía
    async EliminarPersona(data) {
        let uso = await objDao.obtenerUno('SELECT ' + SQL_HISTORIAL + ' FROM persona p WHERE p.id_persona = $1', [data.id_persona]);
        if (uso && (uso.residencias > 0 || uso.traspasos > 0 || uso.cargos > 0)) {
            throw new Error('No se puede eliminar: la persona tiene historial en el condominio (residencias, traspasos o cargos a su nombre)');
        }
        let sql = 'DELETE FROM persona WHERE id_persona = $1';
        return objDao.ejecutar(sql, [data.id_persona]);
    }
}

module.exports = personaModel;
