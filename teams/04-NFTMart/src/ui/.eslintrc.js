// add override for any (a metric ton of them, initial conversion)
const config = {
  extends: [
    'eslint-config-airbnb-base',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'eslint-comments',
    'react',
    'jest',
    'unicorn',
    'react-hooks',
    'simple-import-sort',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  // parserOptions: {
  //   project: './tsconfig.json',
  //   ecmaFeatures: {
  //     jsx: true,
  //   },
  // },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },
    'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts'],
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    polyfills: ['fetch', 'Promise', 'URL', 'object-assign'],
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react/prop-types': 'off',
    'header/header': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-var-requires': 'off',
    'import/extensions': [
      'warn',
      'always',
      {
        js: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};

module.exports = config;
