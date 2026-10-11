import 'dotenv/config';
import { z } from 'zod/v4';
import { type InstanceMode, type NodeEnv, parseControlEnv } from './control';
import { type FlatRedisSchema, type RedisSchema, parseRedisEnv } from './redis';

const connectionOptionsShape = {
	BULLMQ_REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().default(5000),
	EMAIL_WORKER_CONCURRENCY: z.coerce.number().int().min(1).default(5),
};

const managedBullmqSchema = z.object({
	REDIS_MODE: z.literal('managed'),
	...connectionOptionsShape,
});

const externalBullmqSchema = z.object({
	REDIS_MODE: z.literal('external'),
	BULLMQ_REDIS_HOST: z.string().min(1).default('localhost'),
	BULLMQ_REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
	BULLMQ_REDIS_USERNAME: z.string().default(''),
	BULLMQ_REDIS_PASSWORD: z.string().default(''),
	BULLMQ_REDIS_DATABASE: z.coerce.number().int().min(0).default(0),
	...connectionOptionsShape,
});

export const bullmqSchema = z.discriminatedUnion('REDIS_MODE', [managedBullmqSchema, externalBullmqSchema]);

export type BullmqSchema = z.infer<typeof bullmqSchema>;

export type FlatBullmqSchema = z.infer<typeof externalBullmqSchema>;

const BULLMQ_TO_REDIS_FALLBACK = {
	BULLMQ_REDIS_HOST: 'REDIS_HOST',
	BULLMQ_REDIS_PORT: 'REDIS_PORT',
	BULLMQ_REDIS_USERNAME: 'REDIS_USERNAME',
	BULLMQ_REDIS_PASSWORD: 'REDIS_PASSWORD',
	BULLMQ_REDIS_DATABASE: 'REDIS_DATABASE',
	BULLMQ_REDIS_CONNECT_TIMEOUT_MS: 'REDIS_CONNECT_TIMEOUT_MS',
} as const satisfies Record<string, keyof FlatRedisSchema>;

const applyRedisFallback = (source: NodeJS.ProcessEnv, redis: RedisSchema): NodeJS.ProcessEnv => {
	const merged: NodeJS.ProcessEnv = { ...source };

	for (const [bullmqKey, redisKey] of Object.entries(BULLMQ_TO_REDIS_FALLBACK)) {
		if (merged[bullmqKey] !== undefined) {
			continue;
		}

		const redisValue = (redis as Record<string, unknown>)[redisKey];
		if (redisValue !== undefined) {
			merged[bullmqKey] = String(redisValue);
		}
	}

	return merged;
};

export const parseBullmqEnv = (
	source: NodeJS.ProcessEnv = process.env,
	mode?: InstanceMode,
	nodeEnv?: NodeEnv,
	redis?: RedisSchema,
): BullmqSchema => {
	const resolvedMode = mode ?? parseControlEnv(source, nodeEnv).REDIS_MODE;
	const resolvedRedis = redis ?? parseRedisEnv(source, resolvedMode, nodeEnv);
	const mergedSource = applyRedisFallback(source, resolvedRedis);

	return bullmqSchema.parse({ ...mergedSource, REDIS_MODE: resolvedMode });
};
