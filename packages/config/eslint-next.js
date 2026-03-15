// @ts-check
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

/**
 * Creates a Next.js flat ESLint config.
 * Pass __dirname from the consuming app so FlatCompat can resolve plugins correctly.
 * @param {string} baseDirectory
 * @returns {import("eslint").Linter.Config[]}
 */
function createNextConfig(baseDirectory) {
   const compat = new FlatCompat({ baseDirectory });

   return [
      js.configs.recommended,
      ...compat.extends('next/core-web-vitals', 'next/typescript'),
      prettier,
      {
         rules: {
            'no-console': 'warn',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
         },
      },
   ];
}

module.exports = { createNextConfig };
