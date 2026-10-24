import 'dotenv/config';
import { z } from 'zod/v4';
import { type NodeEnv, parseNodeEnv } from './node';

const cookieSecretEnvMap = {
	development: z.string().min(1, { message: 'secret must be at least 1 character in development environment' }),
	testing: z
		.string()
		.min(1, { message: 'secret must be at least 1 character in testing environment if specified' })
		.default('bad-cookie-secret-testing'),
	e2e: z
		.string()
		.min(1, { message: 'secret must be at least 1 character in e2e environment if specified' })
		.default('bad-cookie-secret-e2e'),
	production: z.string().min(32, { message: 'secret must be at least 32 characters in production' }),
} satisfies Record<NodeEnv, z.ZodType<string>>;

const accessTokenSecretEnvMap = {
	production: z.string().min(32, { message: 'secret must be at least 32 characters in production' }),
	development: z.string().min(1, { message: 'secret must be at least 1 character in development environment' }),
	testing: z
		.string()
		.min(1, { message: 'secret must be at least 1 character in testing environment if specified' })
		.default('bad-access-token-secret-testing'),
	e2e: z
		.string()
		.min(1, { message: 'secret must be at least 1 character in e2e environment if specified' })
		.default('bad-access-token-secret-e2e'),
} satisfies Record<NodeEnv, z.ZodType<string>>;

const refreshTokenSecretEnvMap = {
	production: z.string().min(32, { message: 'secret must be at least 32 characters in production' }),
	development: z.string().min(1, { message: 'secret must be at least 1 character in development environment' }),
	testing: z
		.string()
		.min(1, { message: 'secret must be at least 1 character in testing environment if specified' })
		.default('bad-refresh-token-secret-testing'),
	e2e: z
		.string()
		.min(1, { message: 'secret must be at least 1 character in e2e environment if specified' })
		.default('bad-refresh-token-secret-e2e'),
} satisfies Record<NodeEnv, z.ZodType<string>>;

const accessTokenExpiresInSecondsEnvMap = {
	production: z.coerce
		.number()
		.int()
		.positive()
		.max(3600, { message: 'ACCESS_TOKEN_EXPIRES_IN_SECONDS must be at most 3600 (1 hour) in production' }),
	development: z.coerce.number().int().positive(),
	testing: z.coerce.number().int().positive().default(2),
	e2e: z.coerce.number().int().positive().default(2),
} satisfies Record<NodeEnv, z.ZodType<number>>;

const refreshTokenExpiresInSecondsEnvMap = {
	production: z.coerce
		.number()
		.int()
		.positive()
		.max(2592000, { message: 'REFRESH_TOKEN_EXPIRES_IN_SECONDS must be at most 2592000 (30 days) in production' }),
	development: z.coerce.number().int().positive(),
	testing: z.coerce.number().int().positive().default(5),
	e2e: z.coerce.number().int().positive().default(5),
} satisfies Record<NodeEnv, z.ZodType<number>>;

// VERIFICATION_TOKEN_* configures the single-use action tokens for email verification and password
// reset that are persisted in the `tokens` collection. The env-var name follows purpose-naming while
// the collection follows module-namespace naming, so the names diverge on purpose — do not "fix" the
// mismatch by renaming either side.
const verificationTokenExpiresInSecondsEnvMap = {
	production: z.coerce.number().int().positive().max(86400, {
		message: 'VERIFICATION_TOKEN_EXPIRES_IN_SECONDS must be at most 86400 (24 hours) in production',
	}),
	development: z.coerce.number().int().positive(),
	testing: z.coerce.number().int().positive().default(5),
	e2e: z.coerce.number().int().positive().default(5),
} satisfies Record<NodeEnv, z.ZodType<number>>;

// VERIFICATION_TOKEN_SIZE is the hex-character count of the generated token. It must be EVEN in every
// environment because the crypto provider derives it from randomBytes(size / 2); an odd value
// breaks generation. Production additionally enforces a [32, 128] entropy window (>= 128 bits).
const isEven = (value: number): boolean => value % 2 === 0;

const verificationTokenSizeEnvMap = {
	production: z.coerce
		.number()
		.int()
		.positive()
		.min(32, { message: 'VERIFICATION_TOKEN_SIZE must be at least 32 hex characters (128 bits) in production' })
		.max(128, { message: 'VERIFICATION_TOKEN_SIZE must be at most 128 hex characters in production' })
		.refine(isEven, { message: 'VERIFICATION_TOKEN_SIZE must be an even number of hex characters' }),
	development: z.coerce
		.number()
		.int()
		.positive()
		.refine(isEven, { message: 'VERIFICATION_TOKEN_SIZE must be an even number of hex characters' })
		.default(16),
	testing: z.coerce
		.number()
		.int()
		.positive()
		.refine(isEven, { message: 'VERIFICATION_TOKEN_SIZE must be an even number of hex characters' })
		.default(16),
	e2e: z.coerce
		.number()
		.int()
		.positive()
		.refine(isEven, { message: 'VERIFICATION_TOKEN_SIZE must be an even number of hex characters' })
		.default(16),
} satisfies Record<NodeEnv, z.ZodType<number>>;

const passwordHashRoundsEnvMap = {
	production: z.coerce
		.number()
		.int()
		.min(12, { message: 'PASSWORD_HASH_ROUNDS must be at least 12 in production' })
		.max(15, { message: 'PASSWORD_HASH_ROUNDS must be at most 15 in production' }),
	development: z.coerce.number().int().positive().default(8),
	testing: z.coerce.number().int().positive().default(3),
	e2e: z.coerce.number().int().positive().default(3),
} satisfies Record<NodeEnv, z.ZodType<number>>;

const DUMMY_PASSWORD_DEFAULT = 'timing-equalization-placeholder';

// Plaintext hashed by the hash provider into the dummy hash compared against
// during sign-in when the account does not exist (timing-attack defense). The
// provider hashes it with the configured cost, so the dummy comparison always
// matches the real one. Required with real entropy in production; a fixed
// placeholder is fine elsewhere.
const dummyPasswordEnvMap = {
	production: z.string().min(12, { message: 'DUMMY_PASSWORD must be at least 12 characters in production' }),
	development: z.string().min(1).default(DUMMY_PASSWORD_DEFAULT),
	testing: z.string().min(1).default(DUMMY_PASSWORD_DEFAULT),
	e2e: z.string().min(1).default(DUMMY_PASSWORD_DEFAULT),
} satisfies Record<NodeEnv, z.ZodType<string>>;

export const buildAuthSchema = (nodeEnv: NodeEnv) =>
	z.object({
		COOKIE_SECRET: cookieSecretEnvMap[nodeEnv],
		ACCESS_TOKEN_SECRET: accessTokenSecretEnvMap[nodeEnv],
		REFRESH_TOKEN_SECRET: refreshTokenSecretEnvMap[nodeEnv],
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: accessTokenExpiresInSecondsEnvMap[nodeEnv],
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: refreshTokenExpiresInSecondsEnvMap[nodeEnv],
		VERIFICATION_TOKEN_EXPIRES_IN_SECONDS: verificationTokenExpiresInSecondsEnvMap[nodeEnv],
		VERIFICATION_TOKEN_SIZE: verificationTokenSizeEnvMap[nodeEnv],
		PASSWORD_HASH_ROUNDS: passwordHashRoundsEnvMap[nodeEnv],
		DUMMY_PASSWORD: dummyPasswordEnvMap[nodeEnv],
	});

export type AuthSchema = z.infer<ReturnType<typeof buildAuthSchema>>;

export const parseAuthEnv = (source: NodeJS.ProcessEnv = process.env, nodeEnv?: NodeEnv): AuthSchema => {
	const resolvedNodeEnv = nodeEnv ?? parseNodeEnv(source).NODE_ENV;
	return buildAuthSchema(resolvedNodeEnv).parse(source);
};
