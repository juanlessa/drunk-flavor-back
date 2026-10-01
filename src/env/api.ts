import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

export const apiEnvOptions = ['development', 'staging', 'production'] as const;

export type ApiEnv = (typeof apiEnvOptions)[number];

const API_ENV_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['development', 'e2e', 'testing'];

const API_ENV_DEFAULT: ApiEnv = 'development';
const API_DEFAULT_HOST = '0.0.0.0';
const API_DEFAULT_PORT = 3333;

export const buildApiSchema = (nodeEnv: NodeEnv) => {
	const apiEnv = API_ENV_OPTIONAL_ENVIRONMENTS.includes(nodeEnv)
		? z.enum(apiEnvOptions).default(API_ENV_DEFAULT)
		: z.enum(apiEnvOptions);

	return z.object({
		API_ENV: apiEnv,
		API_HOST: z.string().min(1).default(API_DEFAULT_HOST),
		API_PORT: z.coerce.number().int().min(1).max(65535).default(API_DEFAULT_PORT),
	});
};

export type ApiSchema = z.infer<ReturnType<typeof buildApiSchema>>;

export const parseApiEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): ApiSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildApiSchema(resolvedNodeEnv).parse(source);
};
