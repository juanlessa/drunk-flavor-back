import { z } from 'zod';
import { EnvType, StorageTypeEnum } from './env.types';
import { awsS3Fields } from './env.constants';

// defaults
const TESTING_TOKEN_SECRET = 'token-secret';
const TESTING_COOKIE_SECRET = 'cookie-secret';
const TESTING_SESSION_SECRET = 'session-secret';
const TESTING_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 180; // 3 min
const TESTING_REFRESH_TOKEN_EXPIRES_IN_SECONDS = 600; // 10 min

// fields validation
const nodeEnvValidation = z.enum(['development', 'testing', 'e2e-testing', 'production']).default('development');

const apiEnvValidation = z.enum(['development', 'staging', 'production']).default('development');
const apiHostValidation = z.string().default('0.0.0.0');
const apiPortValidation = z.coerce.number().default(3333);

const logEnabledValidation = z.coerce.boolean().default(false);
const logLevelValidation = z.enum(['debug', 'info', 'error']).default('info');

const mongoUsernameValidation = z.string();
const mongoPasswordValidation = z.string();
const mongoDatabaseValidation = z.string();
const mongoHostValidation = z.string();
const mongoPortValidation = z.coerce.number();
const mongoParamsValidation = z.string();
const mongoMaxPoolSizeValidation = z.coerce.number().default(25);
const mongoServerSelectionTimeoutMsValidation = z.coerce.number().default(500);
const mongoConnectTimeoutMsValidation = z.coerce.number().default(500);

const cookieSecretValidation = z.string();
const sessionSecreteValidation = z.string();
const tokenSecretValidation = z.string();
const accessTokenExpiresInSecondsValidation = z.coerce.number();
const refreshTokenExpiresInSecondsValidation = z.coerce.number();

const storageTypeValidation = z.enum(['local', 's3']).default('local');

const awsS3BucketNameValidation = z.string().optional();
const awsAccessKeyIdValidation = z.string().optional();
const awsSecretAccessKeyValidation = z.string().optional();
const awsDefaultRegionValidation = z.string().optional();

const requireAwsFieldsForStorageS3 = (data: EnvType, ctx: z.RefinementCtx) => {
	if (data.STORAGE_TYPE === StorageTypeEnum.s3) {
		awsS3Fields.forEach((_field) => {
			const field = _field as keyof typeof data;
			if (!data[field]) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${field} is required when STORAGE_TYPE is 's3'`,
					path: [field],
				});
			}
		});
	}
};

// schemas
export const developmentEnvSchema = z
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
		SESSION_SECRET: sessionSecreteValidation,
		TOKEN_SECRET: tokenSecretValidation,
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: accessTokenExpiresInSecondsValidation,
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: refreshTokenExpiresInSecondsValidation,
		// MongoDB
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

export const productionEnvSchema = z
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
		SESSION_SECRET: sessionSecreteValidation,
		TOKEN_SECRET: tokenSecretValidation,
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: accessTokenExpiresInSecondsValidation,
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: refreshTokenExpiresInSecondsValidation,
		// MongoDB
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

export const testingEnvSchema = z.object({
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
	COOKIE_SECRET: cookieSecretValidation.default(TESTING_COOKIE_SECRET),
	SESSION_SECRET: sessionSecreteValidation.default(TESTING_SESSION_SECRET),
	TOKEN_SECRET: tokenSecretValidation.default(TESTING_TOKEN_SECRET),
	ACCESS_TOKEN_EXPIRES_IN_SECONDS: accessTokenExpiresInSecondsValidation.default(
		TESTING_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
	),
	REFRESH_TOKEN_EXPIRES_IN_SECONDS: refreshTokenExpiresInSecondsValidation.default(
		TESTING_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
	),
	// MongoDB
	MONGO_USERNAME: mongoUsernameValidation.default(''),
	MONGO_PASSWORD: mongoPasswordValidation.default(''),
	MONGO_DATABASE: mongoDatabaseValidation.default(''),
	MONGO_HOST: mongoHostValidation.default(''),
	MONGO_PORT: mongoPortValidation.default(0),
	MONGO_PARAMS: mongoParamsValidation.default(''),
	MONGO_MAX_POOL_SIZE: mongoMaxPoolSizeValidation.default(0),
	MONGO_SERVER_SELECTION_TIMEOUT_MS: mongoServerSelectionTimeoutMsValidation.default(0),
	MONGO_CONNECT_TIMEOUT_MS: mongoConnectTimeoutMsValidation.default(0),
	// Storage type
	STORAGE_TYPE: storageTypeValidation.transform(() => StorageTypeEnum.local),
});

export const e2eTestingEnvSchema = z.object({
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
	COOKIE_SECRET: cookieSecretValidation.default(TESTING_COOKIE_SECRET),
	SESSION_SECRET: sessionSecreteValidation.default(TESTING_SESSION_SECRET),
	TOKEN_SECRET: tokenSecretValidation.default(TESTING_TOKEN_SECRET),
	ACCESS_TOKEN_EXPIRES_IN_SECONDS: accessTokenExpiresInSecondsValidation.default(
		TESTING_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
	),
	REFRESH_TOKEN_EXPIRES_IN_SECONDS: refreshTokenExpiresInSecondsValidation.default(
		TESTING_REFRESH_TOKEN_EXPIRES_IN_SECONDS,
	),
	// MongoDB
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
	STORAGE_TYPE: storageTypeValidation.transform(() => StorageTypeEnum.local),
});
