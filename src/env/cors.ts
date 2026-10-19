import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

const CORS_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['development', 'e2e', 'testing'];

const CORS_DEFAULT_ORIGINS: Partial<Record<NodeEnv, string[]>> = {
	development: ['http://localhost:3000'],
	testing: ['http://localhost:3000'],
	e2e: ['http://localhost:3000'],
};

const HTTP_PROTOCOL = /^https?$/; // http or https

const splitOrigins = (value: string): string[] =>
	value
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);

const isBareOrigin = (value: string): boolean => {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return false;
	}
	return url.origin === value;
};

const corsOriginSchema = z
	.url({ protocol: HTTP_PROTOCOL })
	.refine(isBareOrigin, { error: 'Origin must have no path, query, fragment or trailing slash' });

const corsOriginListSchema = z.array(corsOriginSchema).min(1);

export const buildCorsSchema = (nodeEnv: NodeEnv) => {
	const defaultOrigins = CORS_DEFAULT_ORIGINS[nodeEnv];

	const allowedOrigins =
		CORS_OPTIONAL_ENVIRONMENTS.includes(nodeEnv) && defaultOrigins !== undefined
			? z.string().transform(splitOrigins).pipe(corsOriginListSchema).default(defaultOrigins)
			: z.string().transform(splitOrigins).pipe(corsOriginListSchema);

	return z.object({
		CORS_ALLOWED_ORIGINS: allowedOrigins,
	});
};

export type CorsSchema = z.infer<ReturnType<typeof buildCorsSchema>>;

export const parseCorsEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): CorsSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildCorsSchema(resolvedNodeEnv).parse(source);
};
