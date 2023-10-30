import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts']
	},
	resolve: {
		alias: [
			{ find: '@config', replacement: resolve(__dirname, 'src/config/') },
			{ find: '@modules', replacement: resolve(__dirname, 'src/modules/') },
			{ find: '@shared', replacement: resolve(__dirname, 'src/shared/') },
			{ find: '@utils', replacement: resolve(__dirname, 'src/utils/') }
		]
	}
});
