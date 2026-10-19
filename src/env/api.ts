import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

export const apiEnvOptions = ['development', 'staging', 'production'] as const;

export type ApiEnv = (typeof apiEnvOptions)[number];

export const HTTP_PROTOCOL = /^https?$/;

const API_ENV_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['development', 'e2e', 'testing'];

const API_ENV_DEFAULT: ApiEnv = 'development';
const API_DEFAULT_HOST = '0.0.0.0';
const API_DEFAULT_PORT = 3333;

const isBareOrigin = (value: string): boolean => {
	try {
		return new URL(value).origin === value;
	} catch {
		return false;
	}
};

export const buildApiSchema = (nodeEnv: NodeEnv) => {
	const apiEnv = API_ENV_OPTIONAL_ENVIRONMENTS.includes(nodeEnv)
		? z.enum(apiEnvOptions).default(API_ENV_DEFAULT)
		: z.enum(apiEnvOptions);

	// API_BASE_URL is never required. When provided it must be a bare origin (no path,
	// query, fragment or trailing slash). When absent it is derived from API_HOST/API_PORT
	// of this same schema, so the public base URL stays consistent with the listening socket.
	const apiBaseUrl = z
		.url({ protocol: HTTP_PROTOCOL })
		.refine(isBareOrigin, { message: 'API_BASE_URL must be a bare origin without a path, query or fragment' })
		.optional();

	return z
		.object({
			API_ENV: apiEnv,
			API_HOST: z.string().min(1).default(API_DEFAULT_HOST),
			API_PORT: z.coerce.number().int().min(1).max(65535).default(API_DEFAULT_PORT),
			API_BASE_URL: apiBaseUrl,
		})
		.transform((value) => ({
			...value,
			API_BASE_URL: value.API_BASE_URL ?? `http://${value.API_HOST}:${value.API_PORT}`,
		}));
};

export type ApiSchema = z.infer<ReturnType<typeof buildApiSchema>>;

export const parseApiEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): ApiSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildApiSchema(resolvedNodeEnv).parse(source);
};
