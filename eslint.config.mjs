import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';

export default [
    { ignores: ['node_modules/**', 'public/js/app.js', 'public/js/app.js.map', 'referencia-ing/**'] },
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: { sourceType: 'commonjs', globals: globals.node },
        rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_|^req$' }] }
    },
    { files: ['**/*.mjs'], languageOptions: { sourceType: 'module' } },
    {
        files: ['views/**/*.jsx'],
        languageOptions: {
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } }
        },
        plugins: { 'react-hooks': reactHooks, react },
        rules: { ...reactHooks.configs.recommended.rules, 'react/jsx-uses-vars': 'error' }
    }
];
