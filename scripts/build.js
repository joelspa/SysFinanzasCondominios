const esbuild = require('esbuild');
const path = require('node:path');

const opciones = {
    absWorkingDir: path.join(__dirname, '..'),
    entryPoints: ['./views/app.jsx'],
    tsconfigRaw: {},
    bundle: true,
    outfile: 'public/js/app.js',
    jsx: 'automatic',
    platform: 'browser',
    target: ['es2020'],
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'info'
};

if (require.main === module) {
    esbuild.build(opciones).catch(() => { process.exitCode = 1; });
}

module.exports = opciones;
