import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

const trustProxySchema = z.union([z.stringbool(), z.string().min(1)]);

const trustedProxyEnvMap = {
	production: trustProxySchema,
	development: trustProxySchema.default(false),
	testing: trustProxySchema.default(false),
	e2e: trustProxySchema.default(false),
} satisfies Record<NodeEnv, z.ZodType<string | boolean>>;

export const buildRateLimitSchema = (nodeEnv: NodeEnv) =>
	z.object({
		RATE_LIMIT_TRUSTED_PROXY: trustedProxyEnvMap[nodeEnv],
	});

export type RateLimitSchema = z.infer<ReturnType<typeof buildRateLimitSchema>>;

export const parseRateLimitEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): RateLimitSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildRateLimitSchema(resolvedNodeEnv).parse(source);
};
