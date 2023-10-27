import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		alias: {
			'@config': new URL('./src/config', import.meta.url).pathname,
			'@modules': new URL('./src/modules', import.meta.url).pathname,
			'@shared': new URL('./src/shared', import.meta.url).pathname,
			'@utils': new URL('./src/utils', import.meta.url).pathname
		}
	},
	plugins: [tsconfigPaths()]
});
