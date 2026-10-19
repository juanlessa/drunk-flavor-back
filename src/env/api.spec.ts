import { describe, expect, it } from 'vitest';
import { parseApiEnv } from './api';

const ALL_ENVS = ['development', 'testing', 'e2e', 'production'] as const;
const DEFAULTING_ENVS = ['development', 'testing', 'e2e'] as const;

// A minimal valid source so non-defaulting fields (API_ENV in production) parse.
const baseFor = (overrides: Record<string, string | undefined> = {}) =>
	({ API_ENV: 'production', ...overrides }) as NodeJS.ProcessEnv;

describe('parseApiEnv', () => {
	describe('API_BASE_URL', () => {
		it.each(ALL_ENVS)('accepts a valid bare origin in the "%s" environment', (nodeEnv) => {
			const result = parseApiEnv(baseFor({ API_BASE_URL: 'https://api.example.com' }), nodeEnv);
			expect(result.API_BASE_URL).toBe('https://api.example.com');
		});

		it.each(ALL_ENVS)('is never required and falls back to API_HOST:API_PORT in "%s"', (nodeEnv) => {
			const result = parseApiEnv(baseFor({ API_HOST: 'localhost', API_PORT: '4000' }), nodeEnv);
			expect(result.API_BASE_URL).toBe('http://localhost:4000');
		});

		it('derives the fallback from the default host and port when none are provided', () => {
			const result = parseApiEnv(baseFor(), 'production');
			expect(result.API_BASE_URL).toBe('http://0.0.0.0:3333');
		});

		it.each(ALL_ENVS)('rejects a non-http protocol in the "%s" environment', (nodeEnv) => {
			expect(() => parseApiEnv(baseFor({ API_BASE_URL: 'ftp://api.example.com' }), nodeEnv)).toThrow();
		});

		it.each(ALL_ENVS)('rejects a value with a path, query or trailing slash in the "%s" environment', (nodeEnv) => {
			expect(() => parseApiEnv(baseFor({ API_BASE_URL: 'https://api.example.com/v1' }), nodeEnv)).toThrow();
			expect(() => parseApiEnv(baseFor({ API_BASE_URL: 'https://api.example.com/' }), nodeEnv)).toThrow();
			expect(() => parseApiEnv(baseFor({ API_BASE_URL: 'https://api.example.com?a=1' }), nodeEnv)).toThrow();
		});
	});

	describe('existing fields', () => {
		it.each(DEFAULTING_ENVS)('defaults API_ENV to "development" in the "%s" environment', (nodeEnv) => {
			const result = parseApiEnv({} as NodeJS.ProcessEnv, nodeEnv);
			expect(result.API_ENV).toBe('development');
		});

		it('requires API_ENV in production', () => {
			expect(() => parseApiEnv({} as NodeJS.ProcessEnv, 'production')).toThrow();
		});

		it('applies the default host and port when absent', () => {
			const result = parseApiEnv(baseFor(), 'production');
			expect(result.API_HOST).toBe('0.0.0.0');
			expect(result.API_PORT).toBe(3333);
		});

		it('rejects an out-of-range API_PORT', () => {
			expect(() => parseApiEnv(baseFor({ API_PORT: '70000' }), 'production')).toThrow();
		});
	});
});
