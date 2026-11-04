import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('./', import.meta.url));

export default defineConfig({
	test: {
		// Coverage must live at the root: Vitest collects it for the whole process,
		// so a single block aggregates the unit and integration projects natively.
		// No blob reporters and no merge step are needed. The include/exclude below
		// is the union of what each layer exercises: unit covers the core use cases
		// and shared providers/helpers; integration covers the Mongo/Redis infra.
		coverage: {
			reportsDirectory: './coverage',
			// text prints totals in the terminal; html/lcov are the browsable and CI
			// reports; json-summary and json feed the PR coverage comment action.
			reporter: ['text', 'html', 'lcov', 'json-summary', 'json'],
			include: [
				// Unit layer: core use cases and shared providers/helpers.
				'src/core/**/*.ts',
				'src/shared/providers/**/*.ts',
				'src/shared/helpers/**/*.ts',
				// Integration layer: Mongo/Redis infrastructure under test.
				'src/core/**/infra/mongo/**/*.ts',
				'src/infrastructure/mongo/helpers/duplicateKey.helpers.ts',
				'src/infrastructure/mongo/helpers/mongoose.helpers.ts',
				'src/infrastructure/mongo/helpers/query.helpers.ts',
				'src/infrastructure/maildev/MailDevServer.ts',
				'src/infrastructure/mongo/MongoConnection.ts',
				'src/infrastructure/redis/RedisConnection.ts',
				'src/infrastructure/redis/RedisRateLimit.store.ts',
				'src/infrastructure/fastify/rateLimitStore/IRateLimit.store.ts',
			],
			exclude: [
				// Unit exclusions: infra, schemas, controllers and containers are not
				// unit-covered (infra is exercised by the integration layer instead).
				'src/core/**/schemas/**/*',
				'src/core/**/*.controller.ts',
				'src/core/**/*.schema.ts',
				'src/core/**/*.container.ts',
				'src/shared/providers/**/index.ts',
				// Integration exclusions: container, types and barrel files of the
				// Mongo infra, plus the integration specs themselves.
				'src/core/**/infra/mongo/container/**',
				'src/core/**/infra/mongo/types/**',
				'src/core/**/infra/**/index.ts',
				'src/**/*.int-spec.ts',
			],
		},
		projects: [
			{
				extends: true,
				resolve: {
					tsconfigPaths: true,
				},
				root: rootDir,
				test: {
					name: 'unit',
					env: {
						NODE_ENV: 'testing',
					},
					include: ['src/**/*.spec.ts'],
					exclude: ['src/**/*.e2e-spec.ts', 'src/**/*.int-spec.ts'],
					environment: 'node',
				},
			},
			{
				extends: true,
				resolve: {
					tsconfigPaths: true,
				},
				root: rootDir,
				test: {
					name: 'integration',
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
			},
		],
	},
});
