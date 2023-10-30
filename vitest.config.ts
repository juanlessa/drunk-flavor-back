import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	root: '.',
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		environment: 'node'
	},
	resolve: {
		alias: [
			{ find: '@config', replacement: fileURLToPath(new URL('./src/config', import.meta.url)) },
			{ find: '@modules', replacement: fileURLToPath(new URL('./src/modules', import.meta.url)) },
			{ find: '@shared', replacement: fileURLToPath(new URL('./src/shared', import.meta.url)) },
			{ find: '@utils', replacement: fileURLToPath(new URL('./src/utils', import.meta.url)) }
		]
	}
});
