import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		include: ['src/**/*.e2e-spec.ts'],
		environment: 'mongo',
		threads: false
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
