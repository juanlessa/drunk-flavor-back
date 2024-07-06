import { z } from 'zod';
import {
	accessTokenExpiresInSecondsValidation,
	accessTokenSecretValidation,
	apiEnvValidation,
	apiHostValidation,
	apiPortValidation,
	cookieSecretValidation,
	logEnabledValidation,
	logLevelValidation,
	mongoProtocolValidation,
	mongoUsernameValidation,
	nodeEnvValidation,
	refreshTokenExpiresInSecondsValidation,
	refreshTokenSecretValidation,
	mongoPasswordValidation,
	mongoDatabaseValidation,
	mongoHostValidation,
	mongoPortValidation,
	mongoParamsValidation,
	mongoMaxPoolSizeValidation,
	mongoServerSelectionTimeoutMsValidation,
	mongoConnectTimeoutMsValidation,
	storageTypeValidation,
	awsS3BucketNameValidation,
	awsAccessKeyIdValidation,
	awsSecretAccessKeyValidation,
	awsDefaultRegionValidation,
} from './env.schema';

export type EnvType = {
	// Environment
	NODE_ENV: z.infer<typeof nodeEnvValidation>;
	// API
	API_ENV: z.infer<typeof apiEnvValidation>;
	API_HOST: z.infer<typeof apiHostValidation>;
	API_PORT: z.infer<typeof apiPortValidation>;
	// Logger
	LOG_ENABLED: z.infer<typeof logEnabledValidation>;
	LOG_LEVEL: z.infer<typeof logLevelValidation>;
	// Auth
	COOKIE_SECRET: z.infer<typeof cookieSecretValidation>;
	ACCESS_TOKEN_SECRET: z.infer<typeof accessTokenSecretValidation>;
	ACCESS_TOKEN_EXPIRES_IN_SECONDS: z.infer<typeof accessTokenExpiresInSecondsValidation>;
	REFRESH_TOKEN_SECRET: z.infer<typeof refreshTokenSecretValidation>;
	REFRESH_TOKEN_EXPIRES_IN_SECONDS: z.infer<typeof refreshTokenExpiresInSecondsValidation>;
	// Mongo
	MONGO_PROTOCOL: z.infer<typeof mongoProtocolValidation>;
	MONGO_USERNAME: z.infer<typeof mongoUsernameValidation>;
	MONGO_PASSWORD: z.infer<typeof mongoPasswordValidation>;
	MONGO_DATABASE: z.infer<typeof mongoDatabaseValidation>;
	MONGO_HOST: z.infer<typeof mongoHostValidation>;
	MONGO_PORT: z.infer<typeof mongoPortValidation>;
	MONGO_PARAMS: z.infer<typeof mongoParamsValidation>;
	MONGO_MAX_POOL_SIZE: z.infer<typeof mongoMaxPoolSizeValidation>;
	MONGO_SERVER_SELECTION_TIMEOUT_MS: z.infer<typeof mongoServerSelectionTimeoutMsValidation>;
	MONGO_CONNECT_TIMEOUT_MS: z.infer<typeof mongoConnectTimeoutMsValidation>;
	// Storage type
	STORAGE_TYPE: z.infer<typeof storageTypeValidation>;
	// S3
	AWS_S3_BUCKET_NAME?: z.infer<typeof awsS3BucketNameValidation>;
	AWS_ACCESS_KEY_ID?: z.infer<typeof awsAccessKeyIdValidation>;
	AWS_SECRET_ACCESS_KEY?: z.infer<typeof awsSecretAccessKeyValidation>;
	AWS_DEFAULT_REGION?: z.infer<typeof awsDefaultRegionValidation>;
};
