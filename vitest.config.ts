import { resolve } from 'path';

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		root: resolve(__dirname),
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		alias: [{ find: '@modules/', replacement: resolve(__dirname, 'src/') }]
	},
	plugins: [tsconfigPaths()]
});
