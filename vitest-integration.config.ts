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
		coverage: {
			reportsDirectory: './coverage/integration',
			include: [
				'src/core/drinks/infra/mongo/**/*.ts',
				'src/core/engagement/infra/mongo/**/*.ts',
				'src/infrastructure/mongo/helpers/duplicateKey.helpers.ts',
				'src/infrastructure/mongo/helpers/mongoose.helpers.ts',
				'src/infrastructure/mongo/helpers/query.helpers.ts',
				'src/infrastructure/mongo/MongoConnection.ts',
				'src/infrastructure/redis/RedisConnection.ts',
				'src/infrastructure/redis/RedisRateLimit.store.ts',
				'src/infrastructure/fastify/rateLimitStore/IRateLimit.store.ts',
			],
			exclude: [
				'src/core/**/infra/mongo/container/**',
				'src/core/**/infra/mongo/types/**',
				'src/core/**/infra/**/index.ts',
				'src/**/*.int-spec.ts',
			],
		},
	},
});
