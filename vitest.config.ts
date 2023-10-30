import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export default defineConfig({
	root: resolve(__dirname, './'),
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		environment: 'node',
		globals: true
	},
	resolve: {
		alias: [
			{ find: '@config', replacement: fileURLToPath(new URL('./src/config', import.meta.url)) },
			{ find: /^@modules\/(.*)$/, replacement: `${resolve(__dirname, './src/modules')}/$1` },
			{ find: '@shared', replacement: fileURLToPath(new URL('./src/shared', import.meta.url)) },
			{ find: '@utils', replacement: fileURLToPath(new URL('./src/utils', import.meta.url)) }
		]
	}
});
