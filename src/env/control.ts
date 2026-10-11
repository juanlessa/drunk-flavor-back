import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

export type { NodeEnv };

export const storageTypeOptions = ['local', 's3'] as const;

export const instanceModeOptions = ['managed', 'external'] as const;

export type StorageType = (typeof storageTypeOptions)[number];
export type InstanceMode = (typeof instanceModeOptions)[number];

const STORAGE_TYPE_DEFAULTS: Record<NodeEnv, StorageType> = {
	development: 'local',
	testing: 'local',
	e2e: 'local',
	production: 's3',
};

const MONGO_MODE_DEFAULTS: Record<NodeEnv, InstanceMode> = {
	development: 'external',
	production: 'external',
	testing: 'managed',
	e2e: 'managed',
};

const REDIS_MODE_DEFAULTS: Record<NodeEnv, InstanceMode> = {
	development: 'external',
	production: 'external',
	testing: 'managed',
	e2e: 'managed',
};

export const buildControlSchema = (nodeEnv: NodeEnv) =>
	z.object({
		STORAGE_TYPE: z.enum(storageTypeOptions).default(STORAGE_TYPE_DEFAULTS[nodeEnv]),
		MONGO_MODE: z.enum(instanceModeOptions).default(MONGO_MODE_DEFAULTS[nodeEnv]),
		REDIS_MODE: z.enum(instanceModeOptions).default(REDIS_MODE_DEFAULTS[nodeEnv]),
	});

export type ControlSchema = z.infer<ReturnType<typeof buildControlSchema>>;

export const parseControlEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): ControlSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildControlSchema(resolvedNodeEnv).parse(source);
};
