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
	COOKIE_SECRET: z.string(),
	ACCESS_TOKEN_SECRET: z.string(),
	ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number(),
	REFRESH_TOKEN_SECRET: z.string(),
	REFRESH_TOKEN_EXPIRES_IN_SECONDS: z.coerce.number(),
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
	// Storage type
	STORAGE_TYPE: z.enum(storageTypeOptions),
	// S3
	AWS_S3_BUCKET_NAME: z.string().optional(),
	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_SECRET_ACCESS_KEY: z.string().optional(),
	AWS_DEFAULT_REGION: z.string().optional(),
});
