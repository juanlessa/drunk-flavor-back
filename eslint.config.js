// @ts-check

import tsEslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import vitest from '@vitest/eslint-plugin';

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

/**
 * Module boundary enforcement for the modular monolith.
 *
 * Each bounded context under `src/core/<module>` must stay self-contained. Imports
 * from sibling modules are allowed only through that module's `public` folder;
 * internal entities, repositories, use cases, and infrastructure remain private.
 */
const coreModules = ['accounts', 'drinks', 'engagement'];

const moduleBoundaryConfigs = coreModules.map((module) => {
	const otherModules = coreModules.filter((other) => other !== module);
	return {
		files: [`src/core/${module}/**/*.ts`],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: otherModules.map((other) => ({
						regex: `^@/core/${other}(?:$|/(?!public(?:/|$)))`,
						message: `"${module}" may import from the "${other}" module only through "@/core/${other}/public".`,
					})),
				},
			],
		},
	};
});

const vitestConfig = {
	files: ['src/**/*spec.ts'],
	plugins: {
		'@typescript-eslint': tsEslint.plugin,
		vitest,
	},
	languageOptions: {
		parser: tsEslint.parser,
		parserOptions: {
			project: true,
		},
	},
	rules: {
		...vitest.configs.recommended.rules,
		'vitest/max-nested-describe': ['error', { max: 3 }],
	},
};

export default [
	{ ignores: ['dist/**', 'coverage/**', 'build/**', 'node_modules/**'] },
	...typescriptConfig,
	...moduleBoundaryConfigs,
	vitestConfig,
	eslintConfigPrettier,
];
