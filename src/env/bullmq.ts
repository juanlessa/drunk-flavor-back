import { z } from 'zod/v4';
import { type InstanceMode, type NodeEnv, parseControlEnv } from './control';

const connectionOptionsShape = {
	BULLMQ_REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().default(5000),
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

export const parseBullmqEnv = (
	source: NodeJS.ProcessEnv = process.env,
	mode?: InstanceMode,
	nodeEnv?: NodeEnv,
): BullmqSchema => {
	const resolvedMode = mode ?? parseControlEnv(source, nodeEnv).REDIS_MODE;
	return bullmqSchema.parse({ ...source, REDIS_MODE: resolvedMode });
};
