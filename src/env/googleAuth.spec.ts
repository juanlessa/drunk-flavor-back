import { describe, expect, it } from 'vitest';
import { parseGoogleAuthEnv } from './googleAuth';
import type { NodeEnv } from './node';

const REQUIRING_ENVS = ['production', 'development'] as const;
const DEFAULTING_ENVS = ['testing', 'e2e'] as const;

const GOOGLE_CLIENT_ID_DEFAULT = 'test-google-client-id.apps.googleusercontent.com';
const VALID_CLIENT_ID = 'real-client-id.apps.googleusercontent.com';

const asSource = (env: Record<string, string>) => env as unknown as NodeJS.ProcessEnv;

describe('parseGoogleAuthEnv', () => {
	describe.each(REQUIRING_ENVS)('requires GOOGLE_CLIENT_ID in "%s"', (nodeEnv: NodeEnv) => {
		it('rejects an absent GOOGLE_CLIENT_ID', () => {
			expect(() => parseGoogleAuthEnv(asSource({}), nodeEnv)).toThrow();
		});

		it('rejects an empty GOOGLE_CLIENT_ID', () => {
			expect(() => parseGoogleAuthEnv(asSource({ GOOGLE_CLIENT_ID: '' }), nodeEnv)).toThrow();
		});

		it('accepts a non-empty GOOGLE_CLIENT_ID', () => {
			const result = parseGoogleAuthEnv(asSource({ GOOGLE_CLIENT_ID: VALID_CLIENT_ID }), nodeEnv);
			expect(result.GOOGLE_CLIENT_ID).toBe(VALID_CLIENT_ID);
		});
	});

	describe.each(DEFAULTING_ENVS)('defaults GOOGLE_CLIENT_ID in "%s"', (nodeEnv: NodeEnv) => {
		it('applies the placeholder default when absent', () => {
			const result = parseGoogleAuthEnv(asSource({}), nodeEnv);
			expect(result.GOOGLE_CLIENT_ID).toBe(GOOGLE_CLIENT_ID_DEFAULT);
		});

		it('still honors an explicit value', () => {
			const result = parseGoogleAuthEnv(asSource({ GOOGLE_CLIENT_ID: VALID_CLIENT_ID }), nodeEnv);
			expect(result.GOOGLE_CLIENT_ID).toBe(VALID_CLIENT_ID);
		});
	});
});
