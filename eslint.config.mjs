// @ts-check

import tsEslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import vitest from 'eslint-plugin-vitest';

const typescriptConfig = tsEslint.config({
	files: ['./**/*.ts'],
	plugins: {
		'@typescript-eslint': tsEslint.plugin,
	},
	languageOptions: {
		parser: tsEslint.parser,
		parserOptions: {
			project: true,
		},
	},
	rules: {
		'@typescript-eslint/no-unsafe-argument': 'error',
		'@typescript-eslint/no-unsafe-assignment': 'error',
		'@typescript-eslint/no-unsafe-call': 'error',
		'@typescript-eslint/no-unsafe-member-access': 'error',
		'@typescript-eslint/no-unsafe-return': 'error',

		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/camelcase': 0,
		'@typescript-eslint/no-var-requires': 0,
	},
});

const vitestConfig = {
	files: ['src/**/*spec.ts'],
	plugins: {
		vitest,
	},
	rules: {
		...vitest.configs.recommended.rules,
		'vitest/max-nested-describe': ['error', { max: 3 }],
	},
};

export default [...typescriptConfig, vitestConfig, eslintConfigPrettier];
