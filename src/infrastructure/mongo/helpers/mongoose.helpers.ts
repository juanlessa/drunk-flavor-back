import type { Document } from 'mongoose';
import { parseMongoEnv } from '@/env/mongo';
import { mongoConnectionStringSchema, mongooseConnectionOptionsSchema } from '../schemas/mongoose.schemas';

const mongoEnv = parseMongoEnv();

export const buildConnectionStringFromEnv = () => {
	const { MONGO_PROTOCOL, MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DATABASE, MONGO_PARAMS } =
		mongoConnectionStringSchema.parse(mongoEnv);

	const protocol = MONGO_PROTOCOL;
	const credentials = `${MONGO_USERNAME}:${MONGO_PASSWORD}`;
	const address = `${MONGO_HOST}:${MONGO_PORT}`;
	const database = MONGO_DATABASE;
	const params = MONGO_PARAMS;

	return `${protocol}://${credentials}@${address}/${database}?${params}`;
};

export const buildConnectionOptionsFromEnv = () => {
	const { MONGO_MAX_POOL_SIZE, MONGO_SERVER_SELECTION_TIMEOUT_MS, MONGO_CONNECT_TIMEOUT_MS } =
		mongooseConnectionOptionsSchema.parse(mongoEnv);

	return {
		maxPoolSize: MONGO_MAX_POOL_SIZE,
		serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
		connectTimeoutMS: MONGO_CONNECT_TIMEOUT_MS,
	};
};

export const removeLeanVersionKey = <T>(ret?: T & { __v?: number }) => {
	if (!ret) return;
	delete ret.__v;
};
