import { z } from 'zod/v4';

/**
 * Primary (foundational) environment validation.
 *
 * This is the first validation stage: it resolves `NODE_ENV` on its own, with a
 * fixed default and no dependency on any other variable. Later stages can rely
 * on the parsed `NODE_ENV` to decide defaults and conditional requirements for
 * the remaining environment variables.
 *
 * Values are declared once as a `const` tuple; both the union type and the
 * runtime options list are derived from it, so there is a single source of truth.
 */
export const nodeEnvOptions = ['development', 'production', 'testing', 'e2e'] as const;

export type NodeEnv = (typeof nodeEnvOptions)[number];

export const DEFAULT_NODE_ENV: NodeEnv = 'development';

export const nodeSchema = z.object({
	NODE_ENV: z.enum(nodeEnvOptions).default(DEFAULT_NODE_ENV),
});

export type NodeSchema = z.infer<typeof nodeSchema>;

/**
 * Parses only the `NODE_ENV` variable from the given source (defaults to
 * `process.env`). Use this to obtain a guaranteed `NODE_ENV` before running the
 * dependent validation stages.
 */
export const parseNodeEnv = (source: NodeJS.ProcessEnv = process.env): NodeSchema => nodeSchema.parse(source);
