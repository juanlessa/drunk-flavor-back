import { defineConfig } from 'vitest/config';
import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';

// Optional local overrides for the E2E run. Variables already present in the
// environment win (`override: false`), and a missing file is fine. This runs in
// the Vitest main process, so globalSetup and the forked workers inherit it.
loadDotenv({
	path: fileURLToPath(new URL('./.env.testing', import.meta.url)),
	override: false,
	quiet: true,
});

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	root: fileURLToPath(new URL('./', import.meta.url)),
	test: {
		env: {
			NODE_ENV: 'e2e',
			LOG_LEVEL: 'warn',
		},
		include: ['src/**/*.e2e-spec.ts'],
		environment: 'node',
		globalSetup: ['./src/infrastructure/vitest/e2e/globalSetup.ts'],
		setupFiles: ['./src/infrastructure/vitest/e2e/setup.ts'],
		testTimeout: 30000,
		fileParallelism: false,
		pool: 'forks',
	},
});
