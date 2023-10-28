import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		include: ['src/modules/accounts/**/*.spec.ts'],
		exclude: ['src/**/*.e2e-spec.ts']
	},
	plugins: [tsconfigPaths()]
});
