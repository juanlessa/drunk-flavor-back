import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

/**
 * Domain stage: log variables.
 *
 * `LOG_LEVEL` has no cross-variable requirement; it is a plain enum whose
 * default depends only on `NODE_ENV`. So this stage does not need a
 * discriminated union — it mirrors the node stage (enum + default) but resolves
 * the default per environment like the control stage.
 *
 * Values are declared once as a `const` tuple; both the union type and the
 * runtime options list are derived from it (single source of truth).
 */

export const logLevelOptions = ['silent', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

export type LogLevel = (typeof logLevelOptions)[number];

/**
 * Per-environment default for `LOG_LEVEL`, mirroring the legacy
 * `schemaDefaultBasedOnNodeEnv` behavior (`debug` across all environments).
 */
const LOG_LEVEL_DEFAULTS: Record<NodeEnv, LogLevel> = {
	development: 'debug',
	testing: 'debug',
	e2e: 'debug',
	production: 'debug',
};

/**
 * Builds the log schema with the default resolved for the given `NODE_ENV`.
 */
export const buildLogSchema = (nodeEnv: NodeEnv) =>
	z.object({
		LOG_LEVEL: z.enum(logLevelOptions).default(LOG_LEVEL_DEFAULTS[nodeEnv]),
	});

export type LogSchema = z.infer<ReturnType<typeof buildLogSchema>>;

/**
 * Parses the log variables from the given source (defaults to `process.env`),
 * resolving the per-environment default from the already-parsed `NODE_ENV`.
 *
 * Pass `nodeEnv` when it was already resolved upstream to avoid re-parsing;
 * otherwise it is derived from the source via `parseNodeEnv`.
 */
export const parseLogEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): LogSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildLogSchema(resolvedNodeEnv).parse(source);
};
