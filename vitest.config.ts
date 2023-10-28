import { resolve } from 'path';

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		root: resolve(__dirname),
		include: ['src/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts'],
		alias: [
			{ find: '@config', replacement: resolve(__dirname, 'src/config/') },
			{ find: '@modules', replacement: resolve(__dirname, 'src/modules/') },
			{ find: '@shared', replacement: resolve(__dirname, 'src/shared/') },
			{ find: '@utils', replacement: resolve(__dirname, 'src/utils/') }
		]
	}
});
