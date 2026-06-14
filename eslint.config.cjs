const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = [
  // IGNORES
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/coverage/',
      '**/*.min.js',
      '.config/*',
      'eslint.config.cjs',
      'commitlint.config.mjs'
    ],
  },
  // BASE CONFIG
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./client/tsconfig.json', './server/tsconfig.json'],
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // CLIENT SPECIFIC CONFIGS
  {
    files: ['client/**/*.js', 'client/**/*.ts', 'client/**/*.jsx', 'client/**/*.tsx'],
    languageOptions: {
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './client/tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  // SERVER SPECIFIC CONFIGS
  {
    files: ['server/**/*.js', 'server/**/*.ts'],
    languageOptions: {
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './server/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
      },
    },
  },
];