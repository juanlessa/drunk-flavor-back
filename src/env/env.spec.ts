import { describe, it, expect } from 'vitest';
import 'dotenv/config';
import { envSchema } from './env.schema';

describe('envSchema validation', () => {
	describe('NODE_ENV production', () => {
		it('should pass with valid variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'production',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// MongoDB
				MONGO_USERNAME: 'test',
				MONGO_PASSWORD: 'test',
				MONGO_DATABASE: 'test-db',
				MONGO_HOST: 'localhost',
				MONGO_PORT: '27017',
				MONGO_PARAMS: '',
				// Auth
				ACCESS_TOKEN_SECRET: 'secret',
				ACCESS_TOKEN_EXPIRES_IN: '3600',
				REFRESH_TOKEN_SECRET: 'refresh-secret',
				REFRESH_TOKEN_EXPIRES_IN: '7200',
				SESSION_SECRET: 'session-secret'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(true);
		});
		it('should not pass without mongoDB variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'production',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// Auth
				ACCESS_TOKEN_SECRET: 'secret',
				ACCESS_TOKEN_EXPIRES_IN: '3600',
				REFRESH_TOKEN_SECRET: 'refresh-secret',
				REFRESH_TOKEN_EXPIRES_IN: '7200',
				SESSION_SECRET: 'session-secret'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(false);
		});
		it('should not pass without auth variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'production',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// MongoDB
				MONGO_USERNAME: 'test',
				MONGO_PASSWORD: 'test',
				MONGO_DATABASE: 'test-db',
				MONGO_HOST: 'localhost',
				MONGO_PORT: '27017',
				MONGO_PARAMS: ''
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(false);
		});
	});

	describe('NODE_ENV dev', () => {
		it('should pass with valid variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'dev',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// MongoDB
				MONGO_USERNAME: 'test',
				MONGO_PASSWORD: 'test',
				MONGO_DATABASE: 'test-db',
				MONGO_HOST: 'localhost',
				MONGO_PORT: '27017',
				MONGO_PARAMS: '',
				// Auth
				ACCESS_TOKEN_SECRET: 'secret',
				ACCESS_TOKEN_EXPIRES_IN: '3600',
				REFRESH_TOKEN_SECRET: 'refresh-secret',
				REFRESH_TOKEN_EXPIRES_IN: '7200',
				SESSION_SECRET: 'session-secret'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(true);
		});
		it('should not pass without mongoDB variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'dev',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// Auth
				ACCESS_TOKEN_SECRET: 'secret',
				ACCESS_TOKEN_EXPIRES_IN: '3600',
				REFRESH_TOKEN_SECRET: 'refresh-secret',
				REFRESH_TOKEN_EXPIRES_IN: '7200',
				SESSION_SECRET: 'session-secret',
				// Storage type
				STORAGE_TYPE: 'local'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(false);
		});
		it('should not pass without auth variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'dev',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// MongoDB
				MONGO_USERNAME: 'test',
				MONGO_PASSWORD: 'test',
				MONGO_DATABASE: 'test-db',
				MONGO_HOST: 'localhost',
				MONGO_PORT: '27017',
				MONGO_PARAMS: ''
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(false);
		});
	});
	describe('NODE_ENV testing', () => {
		it('should pass without additional environment variables', () => {
			const validEnv = {
				NODE_ENV: 'testing'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(true);
		});
	});

	describe('NODE_ENV e2e-testing', () => {
		it('should pass with valid variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'e2e-testing',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// MongoDB
				MONGO_USERNAME: 'test',
				MONGO_PASSWORD: 'test',
				MONGO_DATABASE: 'test-db',
				MONGO_HOST: 'localhost',
				MONGO_PORT: '27017',
				MONGO_PARAMS: ''
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(true);
		});
		it('should not pass without mongoDB variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'e2e-testing',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(false);
		});
	});

	describe('STORAGE_TYPE s3', () => {
		it('should pass with valid variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'production',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// MongoDB
				MONGO_USERNAME: 'test',
				MONGO_PASSWORD: 'test',
				MONGO_DATABASE: 'test-db',
				MONGO_HOST: 'localhost',
				MONGO_PORT: '27017',
				MONGO_PARAMS: '',
				// Auth
				ACCESS_TOKEN_SECRET: 'secret',
				ACCESS_TOKEN_EXPIRES_IN: '3600',
				REFRESH_TOKEN_SECRET: 'refresh-secret',
				REFRESH_TOKEN_EXPIRES_IN: '7200',
				SESSION_SECRET: 'session-secret',
				// Storage type
				STORAGE_TYPE: 's3',
				// S3
				AWS_S3_BUCKET_NAME: 'test',
				AWS_ACCESS_KEY_ID: 'test-access-key-id',
				AWS_SECRET_ACCESS_KEY: 'test-secret-access-key',
				AWS_DEFAULT_REGION: 'region'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(true);
		});

		it('should not pass without aws variables', () => {
			const validEnv = {
				// Environment
				NODE_ENV: 'production',
				// API
				API_HOST: 'http://localhost',
				API_PORT: '3333',
				// MongoDB
				MONGO_USERNAME: 'test',
				MONGO_PASSWORD: 'test',
				MONGO_DATABASE: 'test-db',
				MONGO_HOST: 'localhost',
				MONGO_PORT: '27017',
				MONGO_PARAMS: '',
				// Auth
				ACCESS_TOKEN_SECRET: 'secret',
				ACCESS_TOKEN_EXPIRES_IN: '3600',
				REFRESH_TOKEN_SECRET: 'refresh-secret',
				REFRESH_TOKEN_EXPIRES_IN: '7200',
				STORAGE_TYPE: 's3'
			};

			const parsed = envSchema.safeParse(validEnv);

			expect(parsed.success).toBe(false);
		});
	});
});
