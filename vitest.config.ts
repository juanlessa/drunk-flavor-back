import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		typecheck: {
			tsconfig: './tsconfig.vitest.json'
		}
	},
	resolve: {
		alias: {
			'@config': resolve(__dirname, 'src/config/'),
			'@modules': resolve(__dirname, 'src/modules/'),
			'@shared': resolve(__dirname, 'src/shared/'),
			'@utils': resolve(__dirname, 'src/utils/')
		}
	}
});
