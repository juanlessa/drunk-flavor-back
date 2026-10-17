import { describe, expect, it } from 'vitest';
import { parseAuthEnv } from './auth';

// A valid, strong production configuration used as a baseline that individual
// tests override field by field. Secrets are >= 32 chars and pairwise distinct.
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

const withProdEnv = (overrides: Record<string, string>) =>
	({ ...STRONG_PROD_ENV, ...overrides }) as unknown as NodeJS.ProcessEnv;

describe('parseAuthEnv', () => {
	describe('production secret hardening', () => {
		it.each([
			['COOKIE_SECRET', 'short'],
			['ACCESS_TOKEN_SECRET', 'short'],
			['REFRESH_TOKEN_SECRET', 'short'],
		] as const)('rejects a %s shorter than 32 characters', (key, value) => {
			expect(() => parseAuthEnv(withProdEnv({ [key]: value }), 'production')).toThrow();
		});

		it.each([
			['COOKIE_SECRET', 'bad-cookie-secret'],
			['ACCESS_TOKEN_SECRET', 'bad-access-token-secret'],
			['REFRESH_TOKEN_SECRET', 'bad-refresh-token-secret'],
		] as const)('rejects the weak placeholder for %s', (key, value) => {
			expect(() => parseAuthEnv(withProdEnv({ [key]: value }), 'production')).toThrow();
		});

		it('rejects non-distinct secrets', () => {
			const shared = 'd'.repeat(40);
			expect(() =>
				parseAuthEnv(
					withProdEnv({ ACCESS_TOKEN_SECRET: shared, REFRESH_TOKEN_SECRET: shared }),
					'production',
				),
			).toThrow();
		});
	});

	describe('production numeric bounds', () => {
		it.each([
			['ACCESS_TOKEN_EXPIRES_IN_SECONDS', '1.5'],
			['REFRESH_TOKEN_EXPIRES_IN_SECONDS', '-1'],
			['USER_TOKEN_EXPIRES_IN_SECONDS', '0'],
		] as const)('rejects a non-positive-integer %s', (key, value) => {
			expect(() => parseAuthEnv(withProdEnv({ [key]: value }), 'production')).toThrow();
		});

		it.each([
			['ACCESS_TOKEN_EXPIRES_IN_SECONDS', '3601'],
			['REFRESH_TOKEN_EXPIRES_IN_SECONDS', '2592001'],
			['USER_TOKEN_EXPIRES_IN_SECONDS', '86401'],
		] as const)('rejects an over-max %s', (key, value) => {
			expect(() => parseAuthEnv(withProdEnv({ [key]: value }), 'production')).toThrow();
		});

		it.each(['31', '33', '16', '130'] as const)('rejects an odd or out-of-range USER_TOKEN_SIZE "%s"', (value) => {
			expect(() => parseAuthEnv(withProdEnv({ USER_TOKEN_SIZE: value }), 'production')).toThrow();
		});

		it.each(['11', '16'] as const)('rejects an out-of-range PASSWORD_HASH_ROUNDS "%s"', (value) => {
			expect(() => parseAuthEnv(withProdEnv({ PASSWORD_HASH_ROUNDS: value }), 'production')).toThrow();
		});
	});

	describe('production acceptance', () => {
		it('accepts a valid strong configuration', () => {
			const result = parseAuthEnv(withProdEnv({}), 'production');

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

	describe('even-ness is enforced in every environment', () => {
		it('rejects an odd USER_TOKEN_SIZE in development', () => {
			expect(() =>
				parseAuthEnv(
					{
						COOKIE_SECRET: 'dev-cookie',
						ACCESS_TOKEN_SECRET: 'dev-access',
						REFRESH_TOKEN_SECRET: 'dev-refresh',
						ACCESS_TOKEN_EXPIRES_IN_SECONDS: '2',
						REFRESH_TOKEN_EXPIRES_IN_SECONDS: '5',
						USER_TOKEN_EXPIRES_IN_SECONDS: '5',
						USER_TOKEN_SIZE: '15',
						PASSWORD_HASH_ROUNDS: '8',
					} as unknown as NodeJS.ProcessEnv,
					'development',
				),
			).toThrow();
		});
	});

	describe('non-production leniency', () => {
		it.each(['testing', 'e2e'] as const)('parses with existing defaults when keys are absent in "%s"', (nodeEnv) => {
			const result = parseAuthEnv({} as NodeJS.ProcessEnv, nodeEnv);

			expect(result.COOKIE_SECRET).toBe('bad-cookie-secret');
			expect(result.ACCESS_TOKEN_SECRET).toBe('bad-access-token-secret');
			expect(result.REFRESH_TOKEN_SECRET).toBe('bad-refresh-token-secret');
			expect(result.ACCESS_TOKEN_EXPIRES_IN_SECONDS).toBe(2);
			expect(result.REFRESH_TOKEN_EXPIRES_IN_SECONDS).toBe(5);
			expect(result.USER_TOKEN_EXPIRES_IN_SECONDS).toBe(5);
			expect(result.USER_TOKEN_SIZE).toBe(16);
			expect(result.PASSWORD_HASH_ROUNDS).toBe(3);
		});

		it('requires secrets and expiries in development (throws when absent)', () => {
			expect(() => parseAuthEnv({} as NodeJS.ProcessEnv, 'development')).toThrow();
		});

		it('accepts weak values in development without the production caps', () => {
			const result = parseAuthEnv(
				{
					COOKIE_SECRET: 'x',
					ACCESS_TOKEN_SECRET: 'y',
					REFRESH_TOKEN_SECRET: 'z',
					ACCESS_TOKEN_EXPIRES_IN_SECONDS: '1',
					REFRESH_TOKEN_EXPIRES_IN_SECONDS: '1',
					USER_TOKEN_EXPIRES_IN_SECONDS: '1',
					USER_TOKEN_SIZE: '16',
					// PASSWORD_HASH_ROUNDS omitted — development default of 8 applies.
				} as unknown as NodeJS.ProcessEnv,
				'development',
			);

			expect(result.COOKIE_SECRET).toBe('x');
			expect(result.USER_TOKEN_SIZE).toBe(16);
			expect(result.PASSWORD_HASH_ROUNDS).toBe(8);
		});
	});
});
