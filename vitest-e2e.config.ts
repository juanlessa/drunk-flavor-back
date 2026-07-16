import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		include: ['src/**/*.e2e-spec.ts'],
		environment: 'mongo',
		testTimeout: 30000,
		fileParallelism: false,
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
	},
});
