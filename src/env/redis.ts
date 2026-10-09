import { z } from 'zod/v4';
import { type InstanceMode, type NodeEnv, parseControlEnv } from './control';

const connectionOptionsShape = {
	REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().default(5000),
};

const managedRedisSchema = z.object({
	REDIS_MODE: z.literal('managed'),
	...connectionOptionsShape,
});

const externalRedisSchema = z.object({
	REDIS_MODE: z.literal('external'),
	REDIS_HOST: z.string().min(1).default('localhost'),
	REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
	REDIS_USERNAME: z.string().default(''),
	REDIS_PASSWORD: z.string().default(''),
	REDIS_DATABASE: z.coerce.number().int().min(0).default(0),
	...connectionOptionsShape,
});

export const redisSchema = z.discriminatedUnion('REDIS_MODE', [managedRedisSchema, externalRedisSchema]);

export type RedisSchema = z.infer<typeof redisSchema>;

export type FlatRedisSchema = z.infer<typeof externalRedisSchema>;

export const parseRedisEnv = (
	source: NodeJS.ProcessEnv = process.env,
	mode?: InstanceMode,
	nodeEnv?: NodeEnv,
): RedisSchema => {
	const resolvedMode = mode ?? parseControlEnv(source, nodeEnv).REDIS_MODE;
	return redisSchema.parse({ ...source, REDIS_MODE: resolvedMode });
};
