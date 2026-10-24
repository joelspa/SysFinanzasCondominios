const esbuild = require('esbuild');
const { spawn } = require('node:child_process');
const opciones = require('./build');

async function iniciar() {
    const contexto = await esbuild.context({
        ...opciones,
        minify: false,
        sourcemap: true,
        define: { 'process.env.NODE_ENV': '"development"' }
    });
    await contexto.rebuild();
    await contexto.watch();

    const servidor = spawn(process.execPath, ['--watch', 'index.js'], {
        cwd: opciones.absWorkingDir,
        stdio: 'inherit',
        windowsHide: true
    });

    async function cerrar() {
        servidor.kill();
        await contexto.dispose();
    }

    process.once('SIGINT', cerrar);
    process.once('SIGTERM', cerrar);
    servidor.once('exit', async (codigo) => {
        await contexto.dispose();
        process.exitCode = codigo || 0;
    });
}

iniciar().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
