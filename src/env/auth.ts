import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

const TEST_ENVIRONMENTS: readonly NodeEnv[] = ['e2e', 'testing'];
const TEST_AND_DEV_ENVIRONMENTS: readonly NodeEnv[] = ['e2e', 'testing', 'development'];

/**
 * A required string that falls back to `defaultValue` only in `environments`,
 * staying required (non-empty) elsewhere.
 */
const stringDefaultForEnvironments = (nodeEnv: NodeEnv, defaultValue: string, environments: readonly NodeEnv[]) =>
	environments.includes(nodeEnv) ? z.string().default(defaultValue) : z.string().min(1);

/**
 * A coerced number that falls back to `defaultValue` only in `environments`,
 * staying required elsewhere.
 */
const numberDefaultForEnvironments = (nodeEnv: NodeEnv, defaultValue: number, environments: readonly NodeEnv[]) =>
	environments.includes(nodeEnv) ? z.coerce.number().default(defaultValue) : z.coerce.number();

const buildPasswordHashRounds = (nodeEnv: NodeEnv) => {
	const schema = z.coerce.number();
	if (TEST_ENVIRONMENTS.includes(nodeEnv)) {
		return schema.default(3);
	}
	if (nodeEnv === 'development') {
		return schema.default(8);
	}
	return schema;
};

export const buildAuthSchema = (nodeEnv: NodeEnv) =>
	z.object({
		// Secrets — default only in test envs, required in dev/prod.
		COOKIE_SECRET: stringDefaultForEnvironments(nodeEnv, 'bad-cookie-secret', TEST_ENVIRONMENTS),
		ACCESS_TOKEN_SECRET: stringDefaultForEnvironments(nodeEnv, 'bad-access-token-secret', TEST_ENVIRONMENTS),
		REFRESH_TOKEN_SECRET: stringDefaultForEnvironments(nodeEnv, 'bad-refresh-token-secret', TEST_ENVIRONMENTS),
		// Token expiry (seconds) — default only in test envs, required in dev/prod.
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: numberDefaultForEnvironments(nodeEnv, 2, TEST_ENVIRONMENTS),
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: numberDefaultForEnvironments(nodeEnv, 5, TEST_ENVIRONMENTS),
		USER_TOKEN_EXPIRES_IN_SECONDS: numberDefaultForEnvironments(nodeEnv, 5, TEST_ENVIRONMENTS),
		// User token size — default in test + development, required in production.
		USER_TOKEN_SIZE: numberDefaultForEnvironments(nodeEnv, 16, TEST_AND_DEV_ENVIRONMENTS),
		// Password hashing rounds — 3 in test, 8 in development, required in production.
		PASSWORD_HASH_ROUNDS: buildPasswordHashRounds(nodeEnv),
	});

export type AuthSchema = z.infer<ReturnType<typeof buildAuthSchema>>;

export const parseAuthEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): AuthSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildAuthSchema(resolvedNodeEnv).parse(source);
};
