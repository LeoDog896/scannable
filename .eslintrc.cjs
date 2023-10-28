module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:functional/currying',
		'plugin:functional/stylistic',
		'prettier'
	],
	plugins: [
		'@typescript-eslint',
		'eslint-plugin-tsdoc',
		'eslint-plugin-perf-standard',
		'functional',
		'svelte3'
	],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		project: ['./tsconfig.eslint.json']
	},
	env: {
		browser: true,
		es2021: true,
		node: true
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
		'@typescript-eslint/prefer-for-of': 'error'
	},
	overrides: [
		{
			files: ['*.test.ts'],
			rules: {
				'functional/functional-parameters': 'off'
			}
		}
	]
};
