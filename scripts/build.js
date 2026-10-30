// Compila los componentes de React (views) en un solo archivo: public/js/app.js
const esbuild = require('esbuild');
const path = require('path');

const opciones = {
    absWorkingDir: path.join(__dirname, '..'),
    entryPoints: ['views/main.jsx'],
    bundle: true,
    outfile: 'public/js/app.js',
    jsx: 'automatic',
    minify: true,
    logLevel: 'info'
};

if (require.main === module) {
    esbuild.build(opciones).catch(() => { process.exitCode = 1; });
}

module.exports = opciones;
