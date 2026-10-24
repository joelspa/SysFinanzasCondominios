const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../index');
const db = require('../models/db');

let servidor;
let baseUrl;
let consultas;

before(async () => {
    servidor = await new Promise((resolve) => {
        const server = app.listen(0, '127.0.0.1', () => resolve(server));
    });
    baseUrl = `http://127.0.0.1:${servidor.address().port}`;
});

beforeEach(() => {
    consultas = [];
    // Las pruebas no acceden a una base de datos del usuario.
    db.query = async (sql, params = []) => {
        consultas.push({ sql, params });
        return { rows: [] };
    };
});

after(async () => {
    await new Promise(resolve => servidor.close(resolve));
    await db.end();
});

const modulos = [
    { nombre: 'departamento', datos: { numero: 'A-101', piso: 1, estado: 'activo', id_tipo_departamento: 1, metros_cuadrados: 80 } },
    { nombre: 'persona', datos: { nombre: 'Persona de prueba', telefono: '70000000', correo: 'prueba@example.com' } },
    { nombre: 'tipo_departamento', datos: { nombre: 'Estándar', descripcion: 'Dos habitaciones', cuota_mensual: 100 } },
    { nombre: 'ingreso', datos: { id_departamento: 1, id_tipo_ingreso: 1, concepto: 'Expensas', monto: 100, fecha: '2026-10-23', metodo_pago: 'efectivo', estado: 'registrado' } },
    { nombre: 'egreso', datos: { id_tipo_egreso: 1, concepto: 'Limpieza', monto: 50, fecha: '2026-10-23', metodo_pago: 'transferencia', estado: 'registrado' } }
];

async function solicitar(ruta, method = 'GET', datos) {
    const respuesta = await fetch(baseUrl + ruta, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: datos === undefined ? undefined : JSON.stringify(datos)
    });
    assert.equal(respuesta.status, 200);
    assert.match(respuesta.headers.get('content-type'), /application\/json/);
    return respuesta.json();
}

test('Express sirve las 21 páginas y conserva los enlaces directos', async () => {
    const rutas = ['/', ...modulos.flatMap(({ nombre }) => [
        `/${nombre}`, `/${nombre}/nuevo`, `/${nombre}/7/editar`, `/${nombre}/7/eliminar`
    ])];
    for (const ruta of rutas) {
        const respuesta = await fetch(baseUrl + ruta);
        assert.equal(respuesta.status, 200, ruta);
        const html = await respuesta.text();
        assert.match(html, /<div id="root"><\/div>/);
        assert.match(html, /\/public\/js\/app.js/);
        assert.match(html, /\/public\/css\/site.css/);
    }
    assert.equal(consultas.length, 0);
});

for (const { nombre, datos } of modulos) {
    test(`${nombre}: listar, obtener, crear, editar y eliminar conservan el contrato JSON`, async () => {
        const registro = { [`id_${nombre}`]: 7, ...datos };
        db.query = async (sql, params = []) => {
            consultas.push({ sql, params });
            return { rows: [registro] };
        };

        assert.deepEqual(await solicitar(`/api/${nombre}`), { Success: true, Data: [registro] });
        assert.deepEqual(await solicitar(`/api/${nombre}/7`), { Success: true, Data: registro });
        assert.deepEqual(await solicitar(`/api/${nombre}`, 'POST', datos), { Success: true, Data: 7 });
        assert.deepEqual(await solicitar(`/api/${nombre}/7`, 'PUT', datos), { Success: true });
        assert.deepEqual(await solicitar(`/api/${nombre}/7`, 'DELETE'), { Success: true });

        assert.equal(consultas.length, 5);
        assert.match(consultas[0].sql, /^SELECT /);
        assert.ok(consultas[1].params.includes('7'));
        assert.match(consultas[2].sql, /^INSERT INTO /);
        assert.match(consultas[3].sql, /^UPDATE /);
        assert.ok(consultas[3].params.includes('7'));
        assert.match(consultas[4].sql, /^DELETE FROM /);
        assert.ok(consultas[4].params.includes('7'));
    });

    test(`${nombre}: formularios vacíos se rechazan sin consultar PostgreSQL`, async () => {
        for (const [method, ruta] of [['POST', `/api/${nombre}`], ['PUT', `/api/${nombre}/7`]]) {
            const resultado = await solicitar(ruta, method, {});
            assert.equal(resultado.Success, false);
            assert.equal(typeof resultado.Mensaje, 'string');
        }
        assert.equal(consultas.length, 0);
    });

    test(`${nombre}: un registro inexistente devuelve un mensaje`, async () => {
        const resultado = await solicitar(`/api/${nombre}/999`);
        assert.equal(resultado.Success, false);
        assert.match(resultado.Mensaje, /no existe/);
    });
}

test('Los catálogos de ingresos y egresos responden con JSON', async () => {
    for (const nombre of ['tipo_ingreso', 'tipo_egreso']) {
        assert.deepEqual(await solicitar(`/api/${nombre}`), { Success: true, Data: [] });
    }
});

test('Un error de PostgreSQL conserva el mensaje de validación del controlador', async () => {
    db.query = async () => { throw Object.assign(new Error('Duplicado'), { code: '23505' }); };
    const resultado = await solicitar('/api/tipo_departamento', 'POST', modulos[2].datos);
    assert.equal(resultado.Success, false);
    assert.match(resultado.Mensaje, /Ya existe/);
});

test('Las rutas desconocidas y los identificadores de página inválidos devuelven 404', async () => {
    for (const ruta of ['/no-existe', '/api/no-existe', '/departamento/texto/editar', '/persona/0/eliminar']) {
        assert.equal((await fetch(baseUrl + ruta)).status, 404, ruta);
    }
});

test('Express responde con JSON ante un cuerpo JSON mal formado', async () => {
    const respuesta = await fetch(baseUrl + '/api/persona', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{'
    });
    assert.equal(respuesta.status, 400);
    assert.equal((await respuesta.json()).Success, false);
    assert.equal(consultas.length, 0);
});
