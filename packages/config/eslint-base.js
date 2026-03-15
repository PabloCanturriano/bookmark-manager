// @ts-check
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

/** @type {import("typescript-eslint").ConfigArray} */
module.exports = tseslint.config(
   js.configs.recommended,
   ...tseslint.configs.recommended,
   prettier,
   {
      rules: {
         'no-console': 'warn',
         '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
   },
);
