import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		include: ['src/**/*.e2e-spec.ts'],
		environment: 'node',
		globalSetup: ['./src/infrastructure/vitest/e2e/globalSetup.ts'],
		setupFiles: ['./src/infrastructure/vitest/e2e/setup.ts'],
		testTimeout: 30000,
		fileParallelism: false,
		pool: 'forks',
	},
});
