module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-tsdoc',
    'eslint-plugin-perf-standard',
    'functional',
  ],
  extends: [
    'notninja/es6',
    'plugin:@typescript-eslint/recommended',
    "plugin:functional/currying",
    'plugin:functional/stylistic',
    'prettier'
  ],
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 13,
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  rules: {
    'valid-jsdoc': 'off',
    'tsdoc/syntax': 'error',
    'require-jsdoc': 'warn',
    'no-console': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-use-before-define': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
  },
  overrides: [
    {
      files: ["test/**/*.ts"],
      rules: {
        "functional/functional-parameters": "off",
      }
    }
  ],
  root: true
};
