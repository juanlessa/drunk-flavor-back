import path from 'path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@modules': path.resolve(__dirname, 'src/modules')
		}
	},
	plugins: [tsconfigPaths()]
});
