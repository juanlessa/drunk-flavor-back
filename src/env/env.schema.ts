import { z } from 'zod';
import {
	apiEnvOptions,
	logLevelOptions,
	mongoPersistenceModeOptions,
	nodeEnvOptions,
	storageTypeOptions,
} from './env.constants';
import { schemaDefaultBasedOnNodeEnv } from './env.helpers';

export const envSchema = z.object({
	// Environment
	NODE_ENV: z.enum(nodeEnvOptions).default('development'),
	// API
	API_ENV: schemaDefaultBasedOnNodeEnv(z.enum(apiEnvOptions), {
		environments: ['development', 'e2e', 'testing'],
		defaultValue: 'development',
	}),
	API_HOST: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: '0.0.0.0',
	}),
	API_PORT: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: 3333,
	}),
	// Logger
	LOG_LEVEL: schemaDefaultBasedOnNodeEnv(z.enum(logLevelOptions), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: 'debug',
	}),
	// Auth
	COOKIE_SECRET: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['e2e', 'testing'],
		defaultValue: 'bad-cookie-secret',
	}),
	ACCESS_TOKEN_SECRET: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['e2e', 'testing'],
		defaultValue: 'bad-access-token-secret',
	}),
	ACCESS_TOKEN_EXPIRES_IN_SECONDS: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['e2e', 'testing'],
		defaultValue: 2,
	}),
	REFRESH_TOKEN_SECRET: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['e2e', 'testing'],
		defaultValue: 'bad-refresh-token-secret',
	}),
	REFRESH_TOKEN_EXPIRES_IN_SECONDS: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['e2e', 'testing'],
		defaultValue: 5,
	}),
	USER_TOKEN_EXPIRES_IN_SECONDS: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['e2e', 'testing'],
		defaultValue: 5,
	}),
	USER_TOKEN_SIZE: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['e2e', 'testing', 'development'],
		defaultValue: 16,
	}),
	PASSWORD_HASH_ROUNDS: schemaDefaultBasedOnNodeEnv(
		z.coerce.number(),
		{ environments: ['testing'], defaultValue: 5 },
		{ environments: ['e2e', 'development'], defaultValue: 8 },
	),
	// MongoDB
	MONGO_PROTOCOL: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: 'mongodb',
	}),
	MONGO_USERNAME: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'e2e', 'testing'],
		defaultValue: '',
	}),
	MONGO_PASSWORD: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'e2e', 'testing'],
		defaultValue: '',
	}),
	MONGO_DATABASE: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'e2e', 'testing'],
		defaultValue: '',
	}),
	MONGO_HOST: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'e2e', 'testing'],
		defaultValue: 'localhost',
	}),
	MONGO_PORT: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['development', 'e2e', 'testing'],
		defaultValue: 27017,
	}),
	MONGO_PARAMS: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: '',
	}),
	MONGO_MAX_POOL_SIZE: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: 25,
	}),
	MONGO_SERVER_SELECTION_TIMEOUT_MS: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: 5000,
	}),
	MONGO_CONNECT_TIMEOUT_MS: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['development', 'e2e', 'testing', 'production'],
		defaultValue: 5000,
	}),
	MONGO_PERSISTENCE_MODE: schemaDefaultBasedOnNodeEnv(
		z.enum(mongoPersistenceModeOptions),
		{ environments: ['development', 'production'], defaultValue: 'inDisk' },
		{ environments: ['testing', 'e2e'], defaultValue: 'inMemory' },
	),
	// SMTP
	SMTP_DOMAIN: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['testing', 'e2e', 'development', 'production'],
		defaultValue: 'drunkflavor.com',
	}),
	SMTP_HOST: schemaDefaultBasedOnNodeEnv(z.string(), { environments: ['testing', 'e2e'], defaultValue: '' }),
	SMTP_PORT: schemaDefaultBasedOnNodeEnv(z.coerce.number(), {
		environments: ['testing', 'e2e', 'development', 'production'],
		defaultValue: 587,
	}),
	SMTP_USERNAME: schemaDefaultBasedOnNodeEnv(z.string(), { environments: ['testing', 'e2e'], defaultValue: '' }),
	SMTP_PASSWORD: schemaDefaultBasedOnNodeEnv(z.string(), { environments: ['testing', 'e2e'], defaultValue: '' }),
	// Storage type
	STORAGE_TYPE: schemaDefaultBasedOnNodeEnv(
		z.enum(storageTypeOptions),
		{ environments: ['development', 'testing', 'e2e'], defaultValue: 'local' },
		{ environments: ['production'], defaultValue: 's3' },
	),
	// S3
	AWS_S3_BUCKET_NAME: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'testing', 'e2e', 'production'],
		defaultValue: '',
	}),
	AWS_ACCESS_KEY_ID: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'testing', 'e2e', 'production'],
		defaultValue: '',
	}),
	AWS_SECRET_ACCESS_KEY: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'testing', 'e2e', 'production'],
		defaultValue: '',
	}),
	AWS_DEFAULT_REGION: schemaDefaultBasedOnNodeEnv(z.string(), {
		environments: ['development', 'testing', 'e2e', 'production'],
		defaultValue: '',
	}),
});
