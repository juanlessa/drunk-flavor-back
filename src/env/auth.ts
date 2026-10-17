import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

/**
 * Environments where secrets, token expiries and hashing rounds may fall back to
 * fixed, intentionally weak defaults so the suite and local tooling run without a
 * populated `.env`. Production never appears here.
 */
const TEST_ENVIRONMENTS: readonly NodeEnv[] = ['e2e', 'testing'];
const TEST_AND_DEV_ENVIRONMENTS: readonly NodeEnv[] = ['e2e', 'testing', 'development'];

// Entropy floor for cookie/JWT signing secrets. Short secrets are brute-forceable
// and enable token forgery, so production rejects anything below this length.
const SECRET_MIN_LENGTH = 32;

// The non-production fallback secrets. They must never reach production, so the
// production parser rejects these exact values.
const WEAK_SECRET_PLACEHOLDERS = ['bad-cookie-secret', 'bad-access-token-secret', 'bad-refresh-token-secret'];

// Upper bounds on token lifetimes (seconds) in production. Long-lived tokens widen
// the window for replay/takeover after a credential leak, so each is capped.
const ACCESS_TOKEN_MAX_SECONDS = 3600; // 1 hour
const REFRESH_TOKEN_MAX_SECONDS = 2592000; // 30 days
const USER_TOKEN_MAX_SECONDS = 86400; // 24 hours

// User (email verification / password reset) token size in hex characters. The
// production floor keeps the token hard to guess; the ceiling is a sanity cap.
const USER_TOKEN_SIZE_MIN = 32;
const USER_TOKEN_SIZE_MAX = 128;

// bcrypt cost factor. The floor keeps hashing strong against offline attacks; the
// ceiling prevents request-time DoS from excessively expensive hashing.
const PASSWORD_HASH_ROUNDS_MIN = 12;
const PASSWORD_HASH_ROUNDS_MAX = 15;

const isProduction = (nodeEnv: NodeEnv): boolean => nodeEnv === 'production';

/**
 * A signing secret. In production it must be long (entropy floor) and must not be
 * one of the known weak placeholders; the value is never echoed in error messages.
 * In test environments it falls back to a fixed default; development stays required
 * but lenient (any non-empty value).
 */
const buildSecretSchema = (nodeEnv: NodeEnv, defaultValue: string) => {
	if (isProduction(nodeEnv)) {
		return z
			.string()
			.min(SECRET_MIN_LENGTH, {
				message: `secret must be at least ${SECRET_MIN_LENGTH} characters in production`,
			})
			.refine((value) => !WEAK_SECRET_PLACEHOLDERS.includes(value), {
				message: 'secret must not be a known weak placeholder in production',
			});
	}
	if (TEST_ENVIRONMENTS.includes(nodeEnv)) {
		return z.string().default(defaultValue);
	}
	return z.string().min(1);
};

/**
 * A positive integer. Non-integer, zero and negative values are invalid in every
 * environment. In production an upper bound caps the value. A default is attached
 * only in the listed environments.
 */
const buildBoundedIntSchema = (
	nodeEnv: NodeEnv,
	options: { defaultValue?: number; environments?: readonly NodeEnv[]; min?: number; max?: number },
) => {
	let schema = z.coerce.number().int().positive();
	if (isProduction(nodeEnv)) {
		if (options.min !== undefined) {
			schema = schema.min(options.min);
		}
		if (options.max !== undefined) {
			schema = schema.max(options.max);
		}
	}
	if (options.defaultValue !== undefined && options.environments?.includes(nodeEnv)) {
		return schema.default(options.defaultValue);
	}
	return schema;
};

/**
 * bcrypt cost factor. Positive integer everywhere; production additionally bounds
 * it to a safe range. Defaults to 3 in test environments and 8 in development.
 */
const buildPasswordHashRoundsSchema = (nodeEnv: NodeEnv) => {
	let schema = z.coerce.number().int().positive();
	if (isProduction(nodeEnv)) {
		return schema.min(PASSWORD_HASH_ROUNDS_MIN).max(PASSWORD_HASH_ROUNDS_MAX);
	}
	if (TEST_ENVIRONMENTS.includes(nodeEnv)) {
		return schema.default(3);
	}
	if (nodeEnv === 'development') {
		return schema.default(8);
	}
	return schema;
};

export const buildAuthSchema = (nodeEnv: NodeEnv) => {
	const schema = z.object({
		// Secrets — default only in test envs, required (and hardened) in dev/prod.
		COOKIE_SECRET: buildSecretSchema(nodeEnv, 'bad-cookie-secret'),
		ACCESS_TOKEN_SECRET: buildSecretSchema(nodeEnv, 'bad-access-token-secret'),
		REFRESH_TOKEN_SECRET: buildSecretSchema(nodeEnv, 'bad-refresh-token-secret'),
		// Token expiry (seconds) — default only in test envs; production caps lifetimes.
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: buildBoundedIntSchema(nodeEnv, {
			defaultValue: 2,
			environments: TEST_ENVIRONMENTS,
			max: ACCESS_TOKEN_MAX_SECONDS,
		}),
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: buildBoundedIntSchema(nodeEnv, {
			defaultValue: 5,
			environments: TEST_ENVIRONMENTS,
			max: REFRESH_TOKEN_MAX_SECONDS,
		}),
		USER_TOKEN_EXPIRES_IN_SECONDS: buildBoundedIntSchema(nodeEnv, {
			defaultValue: 5,
			environments: TEST_ENVIRONMENTS,
			max: USER_TOKEN_MAX_SECONDS,
		}),
		// User token size (hex chars) — default in test + development; production bounds it.
		// Even-ness is enforced below in all envs: the crypto provider builds the token from
		// `randomBytes(size / 2)`, so an odd size would desync generation and validation.
		USER_TOKEN_SIZE: buildBoundedIntSchema(nodeEnv, {
			defaultValue: 16,
			environments: TEST_AND_DEV_ENVIRONMENTS,
			min: USER_TOKEN_SIZE_MIN,
			max: USER_TOKEN_SIZE_MAX,
		}).refine((size) => size % 2 === 0, { message: 'USER_TOKEN_SIZE must be an even number of hex characters' }),
		// Password hashing rounds — 3 in test, 8 in development, bounded range in production.
		PASSWORD_HASH_ROUNDS: buildPasswordHashRoundsSchema(nodeEnv),
	});

	if (!isProduction(nodeEnv)) {
		return schema;
	}

	// Production-only cross-field hardening: the three signing secrets must be
	// pairwise distinct so a single leak cannot compromise cookie signing and both
	// JWT families at once. Secret values are never included in the error message;
	// only the colliding key names are.
	return schema.superRefine((value, ctx) => {
		const secretEntries = [
			['COOKIE_SECRET', value.COOKIE_SECRET],
			['ACCESS_TOKEN_SECRET', value.ACCESS_TOKEN_SECRET],
			['REFRESH_TOKEN_SECRET', value.REFRESH_TOKEN_SECRET],
		] as const;

		for (let i = 0; i < secretEntries.length; i += 1) {
			for (let j = i + 1; j < secretEntries.length; j += 1) {
				if (secretEntries[i][1] === secretEntries[j][1]) {
					ctx.addIssue({
						code: 'custom',
						path: [secretEntries[j][0]],
						message: `${secretEntries[i][0]} and ${secretEntries[j][0]} must be distinct in production`,
					});
				}
			}
		}
	});
};

export type AuthSchema = z.infer<ReturnType<typeof buildAuthSchema>>;

export const parseAuthEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): AuthSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildAuthSchema(resolvedNodeEnv).parse(source);
};
