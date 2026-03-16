/**
 * ESLint configuration migrated to eslint.config.js (ESLint v9+ flat config format)
 */
import eslintRecommendedConfig from 'eslint/conf/eslint-recommended';
import reactPlugin from 'eslint-plugin-react';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const sharedConfigs = [
  eslintRecommendedConfig,
  reactPlugin.configs.recommended,
  tsPlugin.configs.recommended
];

export default [
  ...sharedConfigs,
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
    rules: {
      // project-specific rules go here
    }
  }
];
