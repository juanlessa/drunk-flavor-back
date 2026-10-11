import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildConnectionStringFromEnv } from './mongoose.helpers';

const stubMongoEnv = (overrides: Record<string, string> = {}) => {
	const mongoEnv = {
		MONGO_MODE: 'external',
		MONGO_PROTOCOL: 'mongodb',
		MONGO_USERNAME: 'test-user',
		MONGO_PASSWORD: 'test-password',
		MONGO_HOST: 'localhost',
		MONGO_PORT: '27017',
		MONGO_DATABASE: 'test-database',
		MONGO_PARAMS: 'authSource=admin&replicaSet=rs0',
		...overrides,
	};

	Object.entries(mongoEnv).forEach(([name, value]) => vi.stubEnv(name, value));
};

describe('buildConnectionStringFromEnv', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('should build an external MongoDB connection string', () => {
		stubMongoEnv();

		expect(buildConnectionStringFromEnv()).toBe(
			'mongodb://test-user:test-password@localhost:27017/test-database?authSource=admin&replicaSet=rs0',
		);
	});

	it('should encode reserved characters in credentials and database', () => {
		stubMongoEnv({
			MONGO_USERNAME: 'user:name@example.com',
			MONGO_PASSWORD: 'password/with?#[]',
			MONGO_DATABASE: 'test/database',
		});

		expect(buildConnectionStringFromEnv()).toBe(
			'mongodb://user%3Aname%40example.com:password%2Fwith%3F%23%5B%5D@localhost:27017/test%2Fdatabase?authSource=admin&replicaSet=rs0',
		);
	});

	it('should omit the query delimiter when parameters are empty', () => {
		stubMongoEnv({ MONGO_PARAMS: '' });

		expect(buildConnectionStringFromEnv()).toBe('mongodb://test-user:test-password@localhost:27017/test-database');
	});
});
