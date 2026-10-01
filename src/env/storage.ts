import { z } from 'zod/v4';
import { type NodeEnv, type StorageType, parseControlEnv } from './control';

const localStorageSchema = z.object({
	STORAGE_TYPE: z.literal('local'),
});

/**
 * `s3` branch: AWS credentials, bucket, endpoint and public URL are required.
 * `AWS_DEFAULT_REGION` is optional (runtime falls back to `'auto'`).
 */
const s3StorageSchema = z.object({
	STORAGE_TYPE: z.literal('s3'),
	AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required when STORAGE_TYPE is "s3"'),
	AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required when STORAGE_TYPE is "s3"'),
	AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required when STORAGE_TYPE is "s3"'),
	AWS_S3_ENDPOINT: z.string().min(1, 'AWS_S3_ENDPOINT is required when STORAGE_TYPE is "s3"'),
	AWS_S3_PUBLIC_URL: z.string().min(1, 'AWS_S3_PUBLIC_URL is required when STORAGE_TYPE is "s3"'),
	AWS_DEFAULT_REGION: z.string().default(''),
});

export const storageSchema = z.discriminatedUnion('STORAGE_TYPE', [localStorageSchema, s3StorageSchema]);

export type StorageSchema = z.infer<typeof storageSchema>;

/**
 * Flattened storage shape (the `s3` branch, which carries every AWS key). The
 * composed `env` uses this so consumers can access `env.AWS_*` without needing
 * to narrow on `STORAGE_TYPE`.
 */
export type FlatStorageSchema = z.infer<typeof s3StorageSchema>;

/**
 * Parses the storage variables from the given source (defaults to
 * `process.env`), discriminating on the resolved `STORAGE_TYPE`.
 *
 * The discriminated union needs the discriminator present in the source before
 * parsing, so the resolved `STORAGE_TYPE` (from the control stage) is injected
 * into the source. Pass `storageType` when it was already resolved upstream to
 * avoid re-parsing; otherwise it is derived via `parseControlEnv`.
 */
export const parseStorageEnv = (
	source: NodeJS.ProcessEnv = process.env,
	storageType?: StorageType,
	nodeEnv?: NodeEnv,
): StorageSchema => {
	const resolvedStorageType = storageType ?? parseControlEnv(source, nodeEnv).STORAGE_TYPE;
	return storageSchema.parse({ ...source, STORAGE_TYPE: resolvedStorageType });
};
