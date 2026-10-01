import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

export type { NodeEnv };

export const storageTypeOptions = ['local', 's3'] as const;
export const mongoPersistenceModeOptions = ['inMemory', 'inDisk'] as const;

export type StorageType = (typeof storageTypeOptions)[number];
export type MongoPersistenceMode = (typeof mongoPersistenceModeOptions)[number];

const STORAGE_TYPE_DEFAULTS: Record<NodeEnv, StorageType> = {
	development: 'local',
	testing: 'local',
	e2e: 'local',
	production: 's3',
};

const MONGO_PERSISTENCE_MODE_DEFAULTS: Record<NodeEnv, MongoPersistenceMode> = {
	development: 'inDisk',
	production: 'inDisk',
	testing: 'inMemory',
	e2e: 'inMemory',
};

/**
 * Builds the control schema with defaults resolved for the given `NODE_ENV`.
 */
export const buildControlSchema = (nodeEnv: NodeEnv) =>
	z.object({
		STORAGE_TYPE: z.enum(storageTypeOptions).default(STORAGE_TYPE_DEFAULTS[nodeEnv]),
		MONGO_PERSISTENCE_MODE: z.enum(mongoPersistenceModeOptions).default(MONGO_PERSISTENCE_MODE_DEFAULTS[nodeEnv]),
	});

export type ControlSchema = z.infer<ReturnType<typeof buildControlSchema>>;

export const parseControlEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): ControlSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildControlSchema(resolvedNodeEnv).parse(source);
};
