import { z } from 'zod';
import { requireAwsFieldsForStorageS3 } from './env.helpers';

// fields validation
// Environment
export const nodeEnvValidation = z.enum(['development', 'testing', 'e2e', 'production']).default('development');
// API
export const apiEnvValidation = z.enum(['development', 'staging', 'production']);
export const apiHostValidation = z.string();
export const apiPortValidation = z.coerce.number();
// Logger
export const logEnabledValidation = z.coerce.boolean();
export const logLevelValidation = z.enum(['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal']);
// Auth
export const mongoProtocolValidation = z.string();
export const mongoUsernameValidation = z.string();
export const mongoPasswordValidation = z.string();
export const mongoDatabaseValidation = z.string();
export const mongoHostValidation = z.string();
export const mongoPortValidation = z.coerce.number();
export const mongoParamsValidation = z.string();
export const mongoMaxPoolSizeValidation = z.coerce.number();
export const mongoServerSelectionTimeoutMsValidation = z.coerce.number();
export const mongoConnectTimeoutMsValidation = z.coerce.number();
// MongoDB
export const cookieSecretValidation = z.string();
export const sessionSecreteValidation = z.string();
export const accessTokenSecretValidation = z.string();
export const accessTokenExpiresInSecondsValidation = z.coerce.number();
export const refreshTokenSecretValidation = z.string();
export const refreshTokenExpiresInSecondsValidation = z.coerce.number();
// Storage type
export const storageTypeValidation = z.enum(['local', 's3']);
// S3
export const awsS3BucketNameValidation = z.string().optional();
export const awsAccessKeyIdValidation = z.string().optional();
export const awsSecretAccessKeyValidation = z.string().optional();
export const awsDefaultRegionValidation = z.string().optional();

// schemas
export const envSchema = z
	.object({
		// Environment
		NODE_ENV: nodeEnvValidation,
		// API
		API_ENV: apiEnvValidation,
		API_HOST: apiHostValidation,
		API_PORT: apiPortValidation,
		// Logger
		LOG_ENABLED: logEnabledValidation,
		LOG_LEVEL: logLevelValidation,
		// Auth
		COOKIE_SECRET: cookieSecretValidation,
		ACCESS_TOKEN_SECRET: accessTokenSecretValidation,
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: accessTokenExpiresInSecondsValidation,
		REFRESH_TOKEN_SECRET: refreshTokenSecretValidation,
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: refreshTokenExpiresInSecondsValidation,
		// MongoDB
		MONGO_PROTOCOL: mongoProtocolValidation,
		MONGO_USERNAME: mongoUsernameValidation,
		MONGO_PASSWORD: mongoPasswordValidation,
		MONGO_DATABASE: mongoDatabaseValidation,
		MONGO_HOST: mongoHostValidation,
		MONGO_PORT: mongoPortValidation,
		MONGO_PARAMS: mongoParamsValidation,
		MONGO_MAX_POOL_SIZE: mongoMaxPoolSizeValidation,
		MONGO_SERVER_SELECTION_TIMEOUT_MS: mongoServerSelectionTimeoutMsValidation,
		MONGO_CONNECT_TIMEOUT_MS: mongoConnectTimeoutMsValidation,
		// Storage type
		STORAGE_TYPE: storageTypeValidation,
		// S3
		AWS_S3_BUCKET_NAME: awsS3BucketNameValidation,
		AWS_ACCESS_KEY_ID: awsAccessKeyIdValidation,
		AWS_SECRET_ACCESS_KEY: awsSecretAccessKeyValidation,
		AWS_DEFAULT_REGION: awsDefaultRegionValidation,
	})
	.superRefine(requireAwsFieldsForStorageS3);
