/**
 * ESLint configuration migrated to eslint.config.js (ESLint v9+ flat config format)
 */
import reactPlugin from 'eslint-plugin-react';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
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
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    rules: {
      // project-specific rules go here
    }
  }
];
