import z from 'zod';

// auth values for testing environment
const TESTING_ACCESS_TOKEN_SECRET = 'access-token-secret';
const TESTING_ACCESS_TOKEN_EXPIRES_IN = 180; // 3 min
const TESTING_REFRESH_TOKEN_SECRET = 'refresh-token-secret';
const TESTING_REFRESH_TOKEN_EXPIRES_IN = 600; // 10 min
const SESSION_SECRET = 'session-secret';

export const envSchema = z
	.object({
		// Environment
		NODE_ENV: z.enum(['dev', 'testing', 'e2e-testing', 'production']).default('dev'),
		// API
		API_HOST: z.string().default('http://localhost'),
		API_PORT: z.coerce.number().default(3333),
		// MongoDB
		MONGO_USERNAME: z.string().default(''), // required if NODE_ENV='dev'|'production'|'e2e-testing'
		MONGO_PASSWORD: z.string().default(''), // required if NODE_ENV='dev'|'production'|'e2e-testing'
		MONGO_DATABASE: z.string().default(''), // required if NODE_ENV='dev'|'production'|'e2e-testing'
		MONGO_HOST: z.string().default(''), // required if NODE_ENV='dev'|'production'|'e2e-testing'
		MONGO_PORT: z.string().default(''), // required if NODE_ENV='dev'|'production'|'e2e-testing'
		MONGO_PARAMS: z.string().default(''), // required if NODE_ENV='dev'|'production'|'e2e-testing'
		// Auth
		ACCESS_TOKEN_SECRET: z.string().default(''), // required if NODE_ENV='dev'|'production'
		ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().default(0), // required if NODE_ENV='dev'|'production'
		REFRESH_TOKEN_SECRET: z.string().default(''), // required if NODE_ENV='dev'|'production'
		REFRESH_TOKEN_EXPIRES_IN: z.coerce.number().default(0), // required if NODE_ENV='dev'|'production'
		SESSION_SECRET: z.string().default(''), // required if NODE_ENV='dev'|'production'
		// Logger
		LOGGER_ENABLED: z.coerce.boolean().default(false),
		LOGGER_LEVEL: z.enum(['debug', 'info', 'error']).default('info'),
		// Storage type
		STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
		// S3
		AWS_S3_BUCKET_NAME: z.string().optional(), // required if STORAGE_TYPE='s3'
		AWS_ACCESS_KEY_ID: z.string().optional(), // required if STORAGE_TYPE='s3'
		AWS_SECRET_ACCESS_KEY: z.string().optional(), // required if STORAGE_TYPE='s3'
		AWS_DEFAULT_REGION: z.string().optional() // required if STORAGE_TYPE='s3'
	})
	.superRefine((data, ctx) => {
		if (data.NODE_ENV === 'testing' || data.NODE_ENV === 'e2e-testing') {
			if (!data.ACCESS_TOKEN_SECRET) data.ACCESS_TOKEN_SECRET = TESTING_ACCESS_TOKEN_SECRET;
			if (!data.ACCESS_TOKEN_EXPIRES_IN) data.ACCESS_TOKEN_EXPIRES_IN = TESTING_ACCESS_TOKEN_EXPIRES_IN;
			if (!data.REFRESH_TOKEN_SECRET) data.REFRESH_TOKEN_SECRET = TESTING_REFRESH_TOKEN_SECRET;
			if (!data.REFRESH_TOKEN_EXPIRES_IN) data.REFRESH_TOKEN_EXPIRES_IN = TESTING_REFRESH_TOKEN_EXPIRES_IN;
			if (!data.SESSION_SECRET) data.SESSION_SECRET = SESSION_SECRET;
		} else {
			const requiredAuthFields = [
				'ACCESS_TOKEN_SECRET',
				'ACCESS_TOKEN_EXPIRES_IN',
				'REFRESH_TOKEN_SECRET',
				'REFRESH_TOKEN_EXPIRES_IN',
				'SESSION_SECRET'
			];

			requiredAuthFields.forEach((_field) => {
				const field = _field as keyof typeof data;
				if (!data[field]) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `${field} is required in non-test environments`,
						path: [field]
					});
				}
			});
		}

		if (data.NODE_ENV === 'testing') {
			data.MONGO_USERNAME = '';
			data.MONGO_PASSWORD = '';
			data.MONGO_DATABASE = '';
			data.MONGO_HOST = '';
			data.MONGO_PORT = '';
			data.MONGO_PARAMS = '';
		} else {
			const requiredMongoFields = [
				'MONGO_USERNAME',
				'MONGO_PASSWORD',
				'MONGO_DATABASE',
				'MONGO_HOST',
				'MONGO_PORT'
			];

			requiredMongoFields.forEach((_field) => {
				const field = _field as keyof typeof data;
				if (!data[field]) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `${field} is required in ${data.NODE_ENV} environment`,
						path: [field]
					});
				}
			});

			if (!data.MONGO_PARAMS && data.MONGO_PARAMS !== '')
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `MONGO_PARAMS is required in ${data.NODE_ENV} environments`,
					path: ['MONGO_PARAMS']
				});
		}

		if (data.STORAGE_TYPE === 's3') {
			const requiredAwsFields = [
				'AWS_S3_BUCKET_NAME',
				'AWS_ACCESS_KEY_ID',
				'AWS_SECRET_ACCESS_KEY',
				'AWS_DEFAULT_REGION'
			];

			requiredAwsFields.forEach((_field) => {
				const field = _field as keyof typeof data;
				if (!data[field]) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `${field} is required when STORAGE_TYPE is 's3'`,
						path: [field]
					});
				}
			});
		} else {
			data.AWS_S3_BUCKET_NAME = data.AWS_S3_BUCKET_NAME || '';
			data.AWS_ACCESS_KEY_ID = data.AWS_ACCESS_KEY_ID || '';
			data.AWS_SECRET_ACCESS_KEY = data.AWS_SECRET_ACCESS_KEY || '';
			data.AWS_DEFAULT_REGION = data.AWS_DEFAULT_REGION || '';
		}
	});

export type EnvType = z.infer<typeof envSchema>;
