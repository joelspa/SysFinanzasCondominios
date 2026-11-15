const express = require('express');
const path = require('path');
const fs = require('fs');

// Carga las variables de conexión a la base de datos (antes de los routers, que abren la conexión)
const archivoEnv = path.join(__dirname, '.env.local');
if (fs.existsSync(archivoEnv)) {
    process.loadEnvFile(archivoEnv);
}

const sesion = require('./config/sesion');
const { requiereSesion, soloAdmin } = require('./middlewares/sesion');
const sesionRouter = require('./routers/sesionRouter');
const indexRouter = require('./routers/indexRouter');
const personaRouter = require('./routers/personaRouter');
const departamentoRouter = require('./routers/departamentoRouter');
const residenteRouter = require('./routers/residenteRouter');
const ingresoRouter = require('./routers/ingresoRouter');
const cargoRouter = require('./routers/cargoRouter');
const traspasoRouter = require('./routers/traspasoRouter');
const egresoRouter = require('./routers/egresoRouter');
const cajaRouter = require('./routers/cajaRouter');
const catalogoRouter = require('./routers/catalogoRouter');
const condominioRouter = require('./routers/condominioRouter');
const usuarioRouter = require('./routers/usuarioRouter');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(sesion);

// API (Express): devuelve JSON. Todo lo que está después de requiereSesion pide haber ingresado.
app.use('/api/sesion', sesionRouter);
app.use('/api', requiereSesion);
app.use('/api/persona', personaRouter);
app.use('/api/departamento', departamentoRouter);
app.use('/api/residente', residenteRouter);
app.use('/api/ingreso', ingresoRouter);
app.use('/api/cargo', cargoRouter);
app.use('/api/traspaso', traspasoRouter);
app.use('/api/egreso', egresoRouter);
app.use('/api/caja', cajaRouter);
app.use('/api/catalogo', catalogoRouter);
app.use('/api/condominio', condominioRouter);
app.use('/api/usuario', soloAdmin, usuarioRouter);

// Páginas: todas cargan la aplicación de React
app.use('/', indexRouter);

app.listen(port, () => {
    console.log(`Escuchando en: http://localhost:${port}`);
});
