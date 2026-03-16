/**
 * ESLint configuration migrated to eslint.config.js (ESLint v9+ format)
 */
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
      react: 'eslint-plugin-react',
      '@typescript-eslint': '@typescript-eslint/eslint-plugin'
    },
    settings: { react: { version: 'detect' } },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    rules: {
      // project-specific rules can go here
    }
  }
];
