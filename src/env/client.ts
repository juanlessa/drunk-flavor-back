import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

export const HTTP_PROTOCOL = /^https?$/;

const CLIENT_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['development', 'e2e', 'testing'];

const CLIENT_BASE_URL_DEFAULT = 'http://localhost:3000';

const isBareOrigin = (value: string): boolean => {
	try {
		return new URL(value).origin === value;
	} catch {
		return false;
	}
};

export const buildClientSchema = (nodeEnv: NodeEnv) => {
	const baseUrlSchema = z
		.url({ protocol: HTTP_PROTOCOL })
		.refine(isBareOrigin, { message: 'CLIENT_BASE_URL must be a bare origin without a path, query or fragment' });

	const clientBaseUrl = CLIENT_OPTIONAL_ENVIRONMENTS.includes(nodeEnv)
		? baseUrlSchema.default(CLIENT_BASE_URL_DEFAULT)
		: baseUrlSchema;

	return z.object({
		CLIENT_BASE_URL: clientBaseUrl,
	});
};

export type ClientSchema = z.infer<ReturnType<typeof buildClientSchema>>;

export const parseClientEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): ClientSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildClientSchema(resolvedNodeEnv).parse(source);
};
