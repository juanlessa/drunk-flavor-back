import { z } from 'zod';

export const mongoConnectionStringSchema = z.object({
	MONGO_PROTOCOL: z.string().min(1, 'MONGO_PROTOCOL must not be empty'),
	MONGO_USERNAME: z.string().min(1, 'MONGO_USERNAME must not be empty'),
	MONGO_PASSWORD: z.string().min(1, 'MONGO_PASSWORD must not be empty'),
	MONGO_HOST: z.string().min(1, 'MONGO_HOST must not be empty'),
	MONGO_PORT: z.number(),
	MONGO_DATABASE: z.string().min(1, 'MONGO_DATABASE must not be empty'),
	MONGO_PARAMS: z.string(),
});

export const mongooseConnectionOptionsSchema = z.object({
	MONGO_MAX_POOL_SIZE: z.number(),
	MONGO_CONNECT_TIMEOUT_MS: z.number(),
	MONGO_SERVER_SELECTION_TIMEOUT_MS: z.number(),
});
