import { describe, expect, it } from 'vitest';
import { parseRateLimitEnv } from './rateLimit';

const NON_PROD_ENVS = ['development', 'testing', 'e2e'] as const;

const empty = () => ({}) as NodeJS.ProcessEnv;

// A minimal production source: in production RATE_LIMIT_TRUSTED_PROXY is required,
// so it must be present for the rest of the object to parse.
const prodSource = (overrides: Record<string, string> = {}) =>
	({ RATE_LIMIT_TRUSTED_PROXY: 'loopback', ...overrides }) as NodeJS.ProcessEnv;

describe('parseRateLimitEnv', () => {
	describe('RATE_LIMIT_TRUSTED_PROXY', () => {
		it('is required in production (throws when absent)', () => {
			expect(() => parseRateLimitEnv(empty(), 'production')).toThrow();
		});

		it.each(NON_PROD_ENVS)('defaults to false in the "%s" environment', (nodeEnv) => {
			expect(parseRateLimitEnv(empty(), nodeEnv).RATE_LIMIT_TRUSTED_PROXY).toBe(false);
		});

		it('accepts a boolean string', () => {
			expect(
				parseRateLimitEnv(prodSource({ RATE_LIMIT_TRUSTED_PROXY: 'true' }), 'production')
					.RATE_LIMIT_TRUSTED_PROXY,
			).toBe(true);
			expect(
				parseRateLimitEnv(prodSource({ RATE_LIMIT_TRUSTED_PROXY: 'false' }), 'production')
					.RATE_LIMIT_TRUSTED_PROXY,
			).toBe(false);
		});

		it('accepts a proxy identifier/IP string', () => {
			expect(
				parseRateLimitEnv(prodSource({ RATE_LIMIT_TRUSTED_PROXY: '127.0.0.1' }), 'production')
					.RATE_LIMIT_TRUSTED_PROXY,
			).toBe('127.0.0.1');
			expect(
				parseRateLimitEnv(prodSource({ RATE_LIMIT_TRUSTED_PROXY: 'loopback' }), 'production')
					.RATE_LIMIT_TRUSTED_PROXY,
			).toBe('loopback');
		});
	});
});
