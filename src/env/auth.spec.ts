import { describe, expect, it } from 'vitest';
import { parseAuthEnv } from './auth';
import type { NodeEnv } from './node';

const ALL_ENVS = ['production', 'development', 'testing', 'e2e'] as const;
const NON_PROD_ENVS = ['development', 'testing', 'e2e'] as const;
const DEFAULTING_ENVS = ['testing', 'e2e'] as const;

// A valid, strong production configuration used as a baseline that individual
// tests override field by field. Secrets are >= 32 chars and distinct.
const STRONG_PROD_ENV = {
	COOKIE_SECRET: 'a'.repeat(32) + '-cookie',
	ACCESS_TOKEN_SECRET: 'b'.repeat(32) + '-access',
	REFRESH_TOKEN_SECRET: 'c'.repeat(32) + '-refresh',
	ACCESS_TOKEN_EXPIRES_IN_SECONDS: '900',
	REFRESH_TOKEN_EXPIRES_IN_SECONDS: '1209600',
	USER_TOKEN_EXPIRES_IN_SECONDS: '3600',
	USER_TOKEN_SIZE: '64',
	PASSWORD_HASH_ROUNDS: '12',
} satisfies Record<string, string>;

// A structurally valid configuration for environments that require values but
// do not enforce production strength (used to override single fields).
const WEAK_VALID_ENV = {
	COOKIE_SECRET: 'x',
	ACCESS_TOKEN_SECRET: 'y',
	REFRESH_TOKEN_SECRET: 'z',
	ACCESS_TOKEN_EXPIRES_IN_SECONDS: '1',
	REFRESH_TOKEN_EXPIRES_IN_SECONDS: '1',
	USER_TOKEN_EXPIRES_IN_SECONDS: '1',
	USER_TOKEN_SIZE: '16',
	PASSWORD_HASH_ROUNDS: '4',
} satisfies Record<string, string>;

// Per-environment defaults applied when keys are absent. Secrets differ between
// testing and e2e so a leak in one environment does not match the other.
const EXPECTED_DEFAULTS = {
	testing: {
		COOKIE_SECRET: 'bad-cookie-secret-testing',
		ACCESS_TOKEN_SECRET: 'bad-access-token-secret-testing',
		REFRESH_TOKEN_SECRET: 'bad-refresh-token-secret-testing',
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: 2,
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: 5,
		USER_TOKEN_EXPIRES_IN_SECONDS: 5,
		USER_TOKEN_SIZE: 16,
		PASSWORD_HASH_ROUNDS: 3,
	},
	e2e: {
		COOKIE_SECRET: 'bad-cookie-secret-e2e',
		ACCESS_TOKEN_SECRET: 'bad-access-token-secret-e2e',
		REFRESH_TOKEN_SECRET: 'bad-refresh-token-secret-e2e',
		ACCESS_TOKEN_EXPIRES_IN_SECONDS: 2,
		REFRESH_TOKEN_EXPIRES_IN_SECONDS: 5,
		USER_TOKEN_EXPIRES_IN_SECONDS: 5,
		USER_TOKEN_SIZE: 16,
		PASSWORD_HASH_ROUNDS: 3,
	},
} satisfies Record<(typeof DEFAULTING_ENVS)[number], Record<string, string | number>>;

const asSource = (env: Record<string, string>) => env as unknown as NodeJS.ProcessEnv;

const withEnv = (base: Record<string, string>, overrides: Record<string, string>) =>
	asSource({ ...base, ...overrides });

const baselineFor = (nodeEnv: NodeEnv): Record<string, string> =>
	nodeEnv === 'production' ? STRONG_PROD_ENV : WEAK_VALID_ENV;

describe('parseAuthEnv', () => {
	describe('production secret hardening', () => {
		it.each([
			['COOKIE_SECRET', 'short'],
			['ACCESS_TOKEN_SECRET', 'short'],
			['REFRESH_TOKEN_SECRET', 'short'],
		] as const)('rejects a %s shorter than 32 characters', (key, value) => {
			expect(() => parseAuthEnv(withEnv(STRONG_PROD_ENV, { [key]: value }), 'production')).toThrow();
		});

		it.each([
			['COOKIE_SECRET', 'bad-cookie-secret'],
			['ACCESS_TOKEN_SECRET', 'bad-access-token-secret'],
			['REFRESH_TOKEN_SECRET', 'bad-refresh-token-secret'],
		] as const)('rejects the weak placeholder for %s', (key, value) => {
			expect(() => parseAuthEnv(withEnv(STRONG_PROD_ENV, { [key]: value }), 'production')).toThrow();
		});
	});

	describe('production numeric bounds', () => {
		it.each([
			['ACCESS_TOKEN_EXPIRES_IN_SECONDS', '1.5'],
			['REFRESH_TOKEN_EXPIRES_IN_SECONDS', '-1'],
			['USER_TOKEN_EXPIRES_IN_SECONDS', '0'],
		] as const)('rejects a non-positive-integer %s', (key, value) => {
			expect(() => parseAuthEnv(withEnv(STRONG_PROD_ENV, { [key]: value }), 'production')).toThrow();
		});

		it.each([
			['ACCESS_TOKEN_EXPIRES_IN_SECONDS', '3601'],
			['REFRESH_TOKEN_EXPIRES_IN_SECONDS', '2592001'],
			['USER_TOKEN_EXPIRES_IN_SECONDS', '86401'],
		] as const)('rejects an over-max %s', (key, value) => {
			expect(() => parseAuthEnv(withEnv(STRONG_PROD_ENV, { [key]: value }), 'production')).toThrow();
		});

		it.each(['31', '33', '16', '130'] as const)('rejects an odd or out-of-range USER_TOKEN_SIZE "%s"', (value) => {
			expect(() => parseAuthEnv(withEnv(STRONG_PROD_ENV, { USER_TOKEN_SIZE: value }), 'production')).toThrow();
		});

		it.each(['11', '16'] as const)('rejects an out-of-range PASSWORD_HASH_ROUNDS "%s"', (value) => {
			expect(() =>
				parseAuthEnv(withEnv(STRONG_PROD_ENV, { PASSWORD_HASH_ROUNDS: value }), 'production'),
			).toThrow();
		});
	});

	describe('production acceptance', () => {
		it('accepts a valid strong configuration', () => {
			const result = parseAuthEnv(asSource(STRONG_PROD_ENV), 'production');

			expect(result.COOKIE_SECRET).toBe(STRONG_PROD_ENV.COOKIE_SECRET);
			expect(result.ACCESS_TOKEN_SECRET).toBe(STRONG_PROD_ENV.ACCESS_TOKEN_SECRET);
			expect(result.REFRESH_TOKEN_SECRET).toBe(STRONG_PROD_ENV.REFRESH_TOKEN_SECRET);
			expect(result.ACCESS_TOKEN_EXPIRES_IN_SECONDS).toBe(900);
			expect(result.REFRESH_TOKEN_EXPIRES_IN_SECONDS).toBe(1209600);
			expect(result.USER_TOKEN_EXPIRES_IN_SECONDS).toBe(3600);
			expect(result.USER_TOKEN_SIZE).toBe(64);
			expect(result.PASSWORD_HASH_ROUNDS).toBe(12);
		});
	});

	describe.each(ALL_ENVS)('USER_TOKEN_SIZE even-ness is enforced in "%s"', (nodeEnv) => {
		it('rejects an odd USER_TOKEN_SIZE', () => {
			// 65 is odd and within the production [32, 128] window, so only the
			// even-ness rule can reject it there; it is also odd in every other env.
			expect(() => parseAuthEnv(withEnv(baselineFor(nodeEnv), { USER_TOKEN_SIZE: '65' }), nodeEnv)).toThrow();
		});
	});

	describe.each(NON_PROD_ENVS)('non-production leniency in "%s"', (nodeEnv) => {
		it('accepts a short secret', () => {
			expect(() => parseAuthEnv(withEnv(baselineFor(nodeEnv), { COOKIE_SECRET: 'x' }), nodeEnv)).not.toThrow();
		});

		it('accepts an expiry above the production cap', () => {
			expect(() =>
				parseAuthEnv(withEnv(baselineFor(nodeEnv), { ACCESS_TOKEN_EXPIRES_IN_SECONDS: '999999' }), nodeEnv),
			).not.toThrow();
		});

		it('accepts a USER_TOKEN_SIZE below the production minimum', () => {
			expect(() => parseAuthEnv(withEnv(baselineFor(nodeEnv), { USER_TOKEN_SIZE: '8' }), nodeEnv)).not.toThrow();
		});

		it('accepts PASSWORD_HASH_ROUNDS below the production minimum', () => {
			expect(() =>
				parseAuthEnv(withEnv(baselineFor(nodeEnv), { PASSWORD_HASH_ROUNDS: '4' }), nodeEnv),
			).not.toThrow();
		});

		it('still rejects a structurally invalid number', () => {
			expect(() =>
				parseAuthEnv(withEnv(baselineFor(nodeEnv), { ACCESS_TOKEN_EXPIRES_IN_SECONDS: '-1' }), nodeEnv),
			).toThrow();
		});
	});

	describe.each(DEFAULTING_ENVS)('defaults in "%s" when keys are absent', (nodeEnv) => {
		it('applies the environment-specific defaults', () => {
			const result = parseAuthEnv(asSource({}), nodeEnv);
			const expected = EXPECTED_DEFAULTS[nodeEnv];

			expect(result.COOKIE_SECRET).toBe(expected.COOKIE_SECRET);
			expect(result.ACCESS_TOKEN_SECRET).toBe(expected.ACCESS_TOKEN_SECRET);
			expect(result.REFRESH_TOKEN_SECRET).toBe(expected.REFRESH_TOKEN_SECRET);
			expect(result.ACCESS_TOKEN_EXPIRES_IN_SECONDS).toBe(expected.ACCESS_TOKEN_EXPIRES_IN_SECONDS);
			expect(result.REFRESH_TOKEN_EXPIRES_IN_SECONDS).toBe(expected.REFRESH_TOKEN_EXPIRES_IN_SECONDS);
			expect(result.USER_TOKEN_EXPIRES_IN_SECONDS).toBe(expected.USER_TOKEN_EXPIRES_IN_SECONDS);
			expect(result.USER_TOKEN_SIZE).toBe(expected.USER_TOKEN_SIZE);
			expect(result.PASSWORD_HASH_ROUNDS).toBe(expected.PASSWORD_HASH_ROUNDS);
		});
	});

	describe('development requirements', () => {
		it('requires secrets and expiries (throws when absent)', () => {
			expect(() => parseAuthEnv(asSource({}), 'development')).toThrow();
		});

		it('accepts weak values without the production caps', () => {
			// PASSWORD_HASH_ROUNDS is omitted so the development default of 8 applies.
			const { PASSWORD_HASH_ROUNDS: _omitted, ...withoutRounds } = WEAK_VALID_ENV;
			const result = parseAuthEnv(asSource(withoutRounds), 'development');

			expect(result.COOKIE_SECRET).toBe('x');
			expect(result.USER_TOKEN_SIZE).toBe(16);
			expect(result.PASSWORD_HASH_ROUNDS).toBe(8);
		});
	});
});
