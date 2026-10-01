import { z } from 'zod/v4';
import { type MongoPersistenceMode, type NodeEnv, parseControlEnv } from './control';

const connectionOptionsShape = {
	MONGO_MAX_POOL_SIZE: z.coerce.number().default(25),
	MONGO_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().default(5000),
	MONGO_CONNECT_TIMEOUT_MS: z.coerce.number().default(5000),
};

const inMemoryMongoSchema = z.object({
	MONGO_PERSISTENCE_MODE: z.literal('inMemory'),
	...connectionOptionsShape,
});

const inDiskMongoSchema = z.object({
	MONGO_PERSISTENCE_MODE: z.literal('inDisk'),
	MONGO_PROTOCOL: z.string().min(1).default('mongodb'),
	MONGO_USERNAME: z.string().min(1, 'MONGO_USERNAME is required when MONGO_PERSISTENCE_MODE is "inDisk"'),
	MONGO_PASSWORD: z.string().min(1, 'MONGO_PASSWORD is required when MONGO_PERSISTENCE_MODE is "inDisk"'),
	MONGO_HOST: z.string().min(1).default('localhost'),
	MONGO_PORT: z.coerce.number().int().min(1).max(65535).default(27017),
	MONGO_DATABASE: z.string().min(1, 'MONGO_DATABASE is required when MONGO_PERSISTENCE_MODE is "inDisk"'),
	MONGO_PARAMS: z.string().default(''),
	...connectionOptionsShape,
});

export const mongoSchema = z.discriminatedUnion('MONGO_PERSISTENCE_MODE', [inMemoryMongoSchema, inDiskMongoSchema]);

export type MongoSchema = z.infer<typeof mongoSchema>;

/**
 * Flattened Mongo shape (the `inDisk` branch, which carries every connection
 * key). The composed `env` uses this so consumers can access `env.MONGO_*`
 * without needing to narrow on `MONGO_PERSISTENCE_MODE`.
 */
export type FlatMongoSchema = z.infer<typeof inDiskMongoSchema>;

export const parseMongoEnv = (
	source: NodeJS.ProcessEnv = process.env,
	persistenceMode?: MongoPersistenceMode,
	nodeEnv?: NodeEnv,
): MongoSchema => {
	const resolvedPersistenceMode = persistenceMode ?? parseControlEnv(source, nodeEnv).MONGO_PERSISTENCE_MODE;
	return mongoSchema.parse({ ...source, MONGO_PERSISTENCE_MODE: resolvedPersistenceMode });
};
