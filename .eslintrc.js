
module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "eslint-plugin-tsdoc",
    "eslint-plugin-perf-standard",
    "functional"
  ],
  "extends": [
    "notninja/es6",
    'plugin:@typescript-eslint/recommended',
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:functional/no-object-orientation",
    "plugin:functional/currying",
    "plugin:functional/stylistic",
  ],
  "env": {
    "node": true,
    "browser": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": 13,
    "tsconfigRootDir": __dirname,
    "project": ['./tsconfig.json'],
  },
  "rules": {
    "valid-jsdoc": "off",
    "tsdoc/syntax": "error",
    "require-jsdoc": "warn",
    "no-console": "error",
    "no-var": "error",
    "prefer-const": "error",
    "no-use-before-define": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "functional/functional-parameters": "warn",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "perf-standard/check-function-inline": "warn",
  }
}