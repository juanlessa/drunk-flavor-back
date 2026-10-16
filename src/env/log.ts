import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

export const logLevelOptions = ['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

export type LogLevel = (typeof logLevelOptions)[number];

const LOG_LEVEL_DEFAULTS: Record<NodeEnv, LogLevel> = {
	development: 'debug',
	testing: 'warn',
	e2e: 'warn',
	production: 'info',
};

const LOG_ENABLED_DEFAULTS: Record<NodeEnv, boolean> = {
	development: true,
	testing: true,
	e2e: true,
	production: true,
};

const LOG_ENABLE_PRETTY_DEFAULTS: Record<NodeEnv, boolean> = {
	development: true,
	testing: true,
	e2e: true,
	production: false,
};

const LOG_PID_HOSTNAME_DEFAULTS: Record<NodeEnv, boolean> = {
	development: false,
	testing: false,
	e2e: false,
	production: true,
};

export const buildLogSchema = (nodeEnv: NodeEnv) =>
	z.object({
		LOG_LEVEL: z.enum(logLevelOptions).default(LOG_LEVEL_DEFAULTS[nodeEnv]),
		LOG_ENABLED: z.stringbool().default(LOG_ENABLED_DEFAULTS[nodeEnv]),
		LOG_ENABLE_PRETTY: z.stringbool().default(LOG_ENABLE_PRETTY_DEFAULTS[nodeEnv]),
		LOG_PID_HOSTNAME: z.stringbool().default(LOG_PID_HOSTNAME_DEFAULTS[nodeEnv]),
	});

export type LogSchema = z.infer<ReturnType<typeof buildLogSchema>>;

/**
 * Parses the log variables from the given source (defaults to `process.env`),
 * resolving the per-environment defaults from the already-parsed `NODE_ENV`.
 *
 * Pass `nodeEnv` when it was already resolved upstream to avoid re-parsing;
 * otherwise it is derived from the source via `parseNodeEnv`.
 */
export const parseLogEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): LogSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildLogSchema(resolvedNodeEnv).parse(source);
};
