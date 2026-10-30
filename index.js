const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Carga las variables de conexión a la base de datos
const archivoEnv = path.join(__dirname, '.env.local');
if (fs.existsSync(archivoEnv)) {
    process.loadEnvFile(archivoEnv);
}

const port = process.env.PORT || 3000;
const indexRouter = require('./routers/indexRouter');
const personaRouter = require('./routers/personaRouter');
const departamentoRouter = require('./routers/departamentoRouter');
const residenteRouter = require('./routers/residenteRouter');
const ingresoRouter = require('./routers/ingresoRouter');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(__dirname + '/public'));

// API (Express): devuelve JSON
app.use('/api/persona', personaRouter);
app.use('/api/departamento', departamentoRouter);
app.use('/api/residente', residenteRouter);
app.use('/api/ingreso', ingresoRouter);

// Páginas: todas cargan la aplicación de React
app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Escuchando en: http://localhost:${port}`);
});
