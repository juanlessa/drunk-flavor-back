import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		env: {
			NODE_ENV: 'testing',
			LOG_LEVEL: 'warn',
		},
		include: ['src/**/*.int-spec.ts'],
		environment: 'node',
		globalSetup: ['./src/infrastructure/vitest/integration/globalSetup.ts'],
		setupFiles: ['./src/infrastructure/vitest/integration/setup.ts'],
		testTimeout: 30000,
		fileParallelism: false,
		pool: 'forks',
	},
});
