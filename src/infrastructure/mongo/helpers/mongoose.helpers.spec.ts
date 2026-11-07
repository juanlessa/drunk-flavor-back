import { beforeEach, describe, expect, it, vi } from 'vitest';

const parseMongoEnv = vi.hoisted(() => vi.fn());
vi.mock('@/env/mongo', () => ({ parseMongoEnv }));

import { buildConnectionOptionsFromEnv, buildConnectionStringFromEnv, removeLeanVersionKey } from './mongoose.helpers';

const connectionOptions = {
	MONGO_MAX_POOL_SIZE: 25,
	MONGO_SERVER_SELECTION_TIMEOUT_MS: 5000,
	MONGO_CONNECT_TIMEOUT_MS: 4000,
};

const externalEnv = (overrides: Record<string, unknown> = {}) => ({
	MONGO_MODE: 'external',
	MONGO_PROTOCOL: 'mongodb',
	MONGO_USERNAME: 'user',
	MONGO_PASSWORD: 'secret',
	MONGO_HOST: 'db.example.com',
	MONGO_PORT: 27017,
	MONGO_DATABASE: 'drunk_flavor',
	MONGO_PARAMS: '',
	...connectionOptions,
	...overrides,
});

describe('Mongoose helpers', () => {
	beforeEach(() => {
		parseMongoEnv.mockReset();
	});

	describe('buildConnectionStringFromEnv', () => {
		it('builds the connection string from the parts of the environment', () => {
			parseMongoEnv.mockReturnValue(externalEnv());

			expect(buildConnectionStringFromEnv()).toBe('mongodb://user:secret@db.example.com:27017/drunk_flavor');
		});

		it('appends the connection params after a question mark', () => {
			parseMongoEnv.mockReturnValue(externalEnv({ MONGO_PARAMS: 'retryWrites=true&w=majority' }));

			expect(buildConnectionStringFromEnv()).toBe(
				'mongodb://user:secret@db.example.com:27017/drunk_flavor?retryWrites=true&w=majority',
			);
		});

		it('uses the protocol, the host and the port that were configured', () => {
			parseMongoEnv.mockReturnValue(
				externalEnv({ MONGO_PROTOCOL: 'mongodb+srv', MONGO_HOST: 'cluster.example.net', MONGO_PORT: 27018 }),
			);

			expect(buildConnectionStringFromEnv()).toBe(
				'mongodb+srv://user:secret@cluster.example.net:27018/drunk_flavor',
			);
		});

		it('encodes the credentials and the database so special characters cannot break the URL', () => {
			parseMongoEnv.mockReturnValue(
				externalEnv({ MONGO_USERNAME: 'us@r', MONGO_PASSWORD: 'p:ss/w#rd', MONGO_DATABASE: 'my db' }),
			);

			expect(buildConnectionStringFromEnv()).toBe(
				'mongodb://us%40r:p%3Ass%2Fw%23rd@db.example.com:27017/my%20db',
			);
		});

		it('refuses to build a connection string when the mongo mode is not external', () => {
			parseMongoEnv.mockReturnValue({ MONGO_MODE: 'managed', ...connectionOptions });

			expect(() => buildConnectionStringFromEnv()).toThrow(
				'Cannot build a MongoDB connection string unless MONGO_MODE is "external".',
			);
		});

		it('reads the environment every time it is called', () => {
			parseMongoEnv.mockReturnValueOnce(externalEnv({ MONGO_DATABASE: 'first' }));
			parseMongoEnv.mockReturnValueOnce(externalEnv({ MONGO_DATABASE: 'second' }));

			expect(buildConnectionStringFromEnv()).toMatch(/\/first$/);
			expect(buildConnectionStringFromEnv()).toMatch(/\/second$/);
		});
	});

	describe('buildConnectionOptionsFromEnv', () => {
		it('maps the environment to the options of the driver', () => {
			parseMongoEnv.mockReturnValue(externalEnv());

			expect(buildConnectionOptionsFromEnv()).toEqual({
				maxPoolSize: 25,
				serverSelectionTimeoutMS: 5000,
				connectTimeoutMS: 4000,
			});
		});

		it('also works when the mongo mode is managed, which has the same options', () => {
			parseMongoEnv.mockReturnValue({
				MONGO_MODE: 'managed',
				MONGO_MAX_POOL_SIZE: 5,
				MONGO_SERVER_SELECTION_TIMEOUT_MS: 1000,
				MONGO_CONNECT_TIMEOUT_MS: 2000,
			});

			expect(buildConnectionOptionsFromEnv()).toEqual({
				maxPoolSize: 5,
				serverSelectionTimeoutMS: 1000,
				connectTimeoutMS: 2000,
			});
		});
	});

	describe('removeLeanVersionKey', () => {
		it('removes the version key and keeps every other field', () => {
			const document = { name: 'Lime', quantity: 2, __v: 3 };

			removeLeanVersionKey(document);

			expect(document).toEqual({ name: 'Lime', quantity: 2 });
			expect(document).not.toHaveProperty('__v');
		});

		it('leaves a document without a version key as it is', () => {
			const document = { name: 'Lime' };

			removeLeanVersionKey(document);

			expect(document).toEqual({ name: 'Lime' });
		});

		it('does nothing when there is no document', () => {
			expect(removeLeanVersionKey(undefined)).toBeUndefined();
		});
	});
});
