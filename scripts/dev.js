// Modo desarrollo: recompila React al guardar y reinicia Express si cambia el backend
const esbuild = require('esbuild');
const { spawn } = require('child_process');
const opciones = require('./build');

async function iniciar() {
    const contexto = await esbuild.context({ ...opciones, minify: false, sourcemap: true });
    await contexto.watch();
    spawn(process.execPath, ['--watch', 'index.js'], { stdio: 'inherit' });
}

iniciar();
