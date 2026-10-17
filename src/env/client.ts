import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

/**
 * Client (frontend) environment validation.
 *
 * Mirrors the CORS env approach of validating a web origin, but for a single URL
 * string instead of a list (the dedicated `cors.ts` module is not present on this
 * branch, so this module follows the existing `smtp.ts`/`api.ts` pattern).
 */

/** Allowed URL protocols for the client base URL. */
export const HTTP_PROTOCOL = /^https?$/;

/** Environments where `CLIENT_BASE_URL` may be omitted and falls back to the default. */
const CLIENT_OPTIONAL_ENVIRONMENTS: readonly NodeEnv[] = ['development', 'e2e', 'testing'];

const CLIENT_BASE_URL_DEFAULT = 'http://localhost:3000';

/**
 * Returns true only when `value` is a bare origin (scheme + host + optional port)
 * with no path, query or fragment. A bare origin is required because the app
 * appends its own known paths (e.g. `/reset-password/<token>`, `/verify-email/<token>`)
 * when building account-email links; a base URL carrying a path would corrupt them.
 */
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
