import type { Document } from 'mongoose';
import { parseMongoEnv } from '@/env/mongo';

export const buildConnectionStringFromEnv = () => {
	const mongoEnv = parseMongoEnv();

	if (mongoEnv.MONGO_MODE !== 'external') {
		throw new Error('Cannot build a MongoDB connection string unless MONGO_MODE is "external".');
	}

	const { MONGO_PROTOCOL, MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DATABASE, MONGO_PARAMS } =
		mongoEnv;

	const protocol = MONGO_PROTOCOL;
	const credentials = `${encodeURIComponent(MONGO_USERNAME)}:${encodeURIComponent(MONGO_PASSWORD)}`;
	const address = `${MONGO_HOST}:${MONGO_PORT}`;
	const database = encodeURIComponent(MONGO_DATABASE);
	const params = MONGO_PARAMS ? `?${MONGO_PARAMS}` : '';

	return `${protocol}://${credentials}@${address}/${database}${params}`;
};

export const buildConnectionOptionsFromEnv = () => {
	const { MONGO_MAX_POOL_SIZE, MONGO_SERVER_SELECTION_TIMEOUT_MS, MONGO_CONNECT_TIMEOUT_MS } = parseMongoEnv();

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
