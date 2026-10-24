const express = require('express');
const path = require('node:path');
const fs = require('node:fs');

const archivoEnv = path.join(__dirname, '.env.local');
if (fs.existsSync(archivoEnv)) {
    process.loadEnvFile(archivoEnv);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api/departamento', require('./routers/departamentoRouter'));
app.use('/api/persona', require('./routers/personaRouter'));
app.use('/api/tipo_departamento', require('./routers/tipoDepartamentoRouter'));
app.use('/api/ingreso', require('./routers/ingresoRouter'));
app.use('/api/egreso', require('./routers/egresoRouter'));
app.use('/api/tipo_ingreso', require('./routers/tipoIngresoRouter'));
app.use('/api/tipo_egreso', require('./routers/tipoEgresoRouter'));
app.use('/api', (req, res) => {
    res.status(404).json({ Success: false, Mensaje: 'La ruta no existe' });
});
app.use('/', require('./routers/indexRouter'));

app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

app.use((error, req, res, _next) => {
    const status = error.status || 500;
    res.status(status).json({
        Success: false,
        Mensaje: status === 400 ? 'El cuerpo de la solicitud no es válido' : 'Error al procesar la solicitud'
    });
});

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Escuchando en: http://localhost:${port}`);
    });
}

module.exports = app;
