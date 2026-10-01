import 'dotenv/config';
import { parseNodeEnv } from './node';
import { parseControlEnv } from './control';
import { parseApiEnv } from './api';
import { parseLogEnv } from './log';
import { parseAuthEnv } from './auth';
import { parseSmtpEnv } from './smtp';
import { type FlatStorageSchema, parseStorageEnv } from './storage';
import { type FlatMongoSchema, parseMongoEnv } from './mongo';

/** AWS keys backfilled when `STORAGE_TYPE` is `local` (they are unused then). */
const EMPTY_STORAGE_KEYS: Omit<FlatStorageSchema, 'STORAGE_TYPE'> = {
	AWS_S3_BUCKET_NAME: '',
	AWS_ACCESS_KEY_ID: '',
	AWS_SECRET_ACCESS_KEY: '',
	AWS_S3_ENDPOINT: '',
	AWS_S3_PUBLIC_URL: '',
	AWS_DEFAULT_REGION: '',
};

/** Mongo connection keys backfilled when `MONGO_PERSISTENCE_MODE` is `inMemory`. */
const EMPTY_MONGO_CONNECTION_KEYS: Omit<
	FlatMongoSchema,
	'MONGO_PERSISTENCE_MODE' | 'MONGO_MAX_POOL_SIZE' | 'MONGO_SERVER_SELECTION_TIMEOUT_MS' | 'MONGO_CONNECT_TIMEOUT_MS'
> = {
	MONGO_PROTOCOL: 'mongodb',
	MONGO_USERNAME: '',
	MONGO_PASSWORD: '',
	MONGO_HOST: 'localhost',
	MONGO_PORT: 27017,
	MONGO_DATABASE: '',
	MONGO_PARAMS: '',
};

/**
 * Flat, fully-keyed environment type exposed to the rest of the app.
 *
 * `STORAGE_TYPE` and `MONGO_PERSISTENCE_MODE` keep their full union type (from
 * the control stage); the AWS and Mongo-connection keys are flattened in from
 * the discriminated-union branches with their discriminant literal stripped, so
 * every key is present without pinning the discriminant to a single branch.
 */
export type Env = ReturnType<typeof parseNodeEnv> &
	ReturnType<typeof parseControlEnv> &
	ReturnType<typeof parseApiEnv> &
	ReturnType<typeof parseLogEnv> &
	ReturnType<typeof parseAuthEnv> &
	ReturnType<typeof parseSmtpEnv> &
	Omit<FlatStorageSchema, 'STORAGE_TYPE'> &
	Omit<FlatMongoSchema, 'MONGO_PERSISTENCE_MODE'>;

const parseEnv = (source: NodeJS.ProcessEnv = process.env): Env => {
	// Stage 1: foundation.
	const { NODE_ENV } = parseNodeEnv(source);

	// Stage 2: control variables (discriminators), resolved against NODE_ENV.
	const control = parseControlEnv(source, NODE_ENV);
	const { STORAGE_TYPE, MONGO_PERSISTENCE_MODE } = control;

	// Stage 3: domain variables.
	const api = parseApiEnv(source, NODE_ENV);
	const log = parseLogEnv(source, NODE_ENV);
	const auth = parseAuthEnv(source, NODE_ENV);
	const smtp = parseSmtpEnv(source, NODE_ENV);
	const storage = parseStorageEnv(source, STORAGE_TYPE, NODE_ENV);
	const mongo = parseMongoEnv(source, MONGO_PERSISTENCE_MODE, NODE_ENV);

	// Backfill the conditional keys that the active branch omits, so the exposed
	// object stays flat and fully keyed. The discriminant itself comes from the
	// control stage (already spread below), so only the branch-specific payload
	// keys are backfilled here.
	const storageKeys: Omit<FlatStorageSchema, 'STORAGE_TYPE'> =
		storage.STORAGE_TYPE === 's3'
			? {
					AWS_S3_BUCKET_NAME: storage.AWS_S3_BUCKET_NAME,
					AWS_ACCESS_KEY_ID: storage.AWS_ACCESS_KEY_ID,
					AWS_SECRET_ACCESS_KEY: storage.AWS_SECRET_ACCESS_KEY,
					AWS_S3_ENDPOINT: storage.AWS_S3_ENDPOINT,
					AWS_S3_PUBLIC_URL: storage.AWS_S3_PUBLIC_URL,
					AWS_DEFAULT_REGION: storage.AWS_DEFAULT_REGION,
				}
			: EMPTY_STORAGE_KEYS;

	const mongoConnectionKeys: Omit<
		FlatMongoSchema,
		| 'MONGO_PERSISTENCE_MODE'
		| 'MONGO_MAX_POOL_SIZE'
		| 'MONGO_SERVER_SELECTION_TIMEOUT_MS'
		| 'MONGO_CONNECT_TIMEOUT_MS'
	> =
		mongo.MONGO_PERSISTENCE_MODE === 'inDisk'
			? {
					MONGO_PROTOCOL: mongo.MONGO_PROTOCOL,
					MONGO_USERNAME: mongo.MONGO_USERNAME,
					MONGO_PASSWORD: mongo.MONGO_PASSWORD,
					MONGO_HOST: mongo.MONGO_HOST,
					MONGO_PORT: mongo.MONGO_PORT,
					MONGO_DATABASE: mongo.MONGO_DATABASE,
					MONGO_PARAMS: mongo.MONGO_PARAMS,
				}
			: EMPTY_MONGO_CONNECTION_KEYS;

	return {
		NODE_ENV,
		...control,
		...api,
		...log,
		...auth,
		...smtp,
		...storageKeys,
		// Connection options are present in both Mongo branches.
		MONGO_MAX_POOL_SIZE: mongo.MONGO_MAX_POOL_SIZE,
		MONGO_SERVER_SELECTION_TIMEOUT_MS: mongo.MONGO_SERVER_SELECTION_TIMEOUT_MS,
		MONGO_CONNECT_TIMEOUT_MS: mongo.MONGO_CONNECT_TIMEOUT_MS,
		...mongoConnectionKeys,
	};
};

export const env = parseEnv();
