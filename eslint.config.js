/**
 * ESLint configuration migrated to eslint.config.js (ESLint v9+ flat config format)
 */
import { FlatCompat } from '@eslint/eslintrc';
import reactPlugin from 'eslint-plugin-react';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const compat = new FlatCompat({
  baseDirectory: new URL('.', import.meta.url).pathname,
  recommendedConfig: 'eslint:recommended'
});
const sharedConfigs = compat.extends(
  'plugin:react/recommended',
  'plugin:@typescript-eslint/recommended'
);

export default [
  ...sharedConfigs,
  {
    ignores: ['.next/**'],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react: reactPlugin,
      '@typescript-eslint': tsPlugin
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // project-specific rules go here
    }
  }
];
