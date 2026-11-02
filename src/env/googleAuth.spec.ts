import { describe, expect, it } from 'vitest';
import { parseGoogleAuthEnv } from './googleAuth';
import type { NodeEnv } from './node';

const REQUIRING_ENVS = ['production', 'development'] as const;
const DEFAULTING_ENVS = ['testing', 'e2e'] as const;

const VARIABLES = [
	{
		name: 'GOOGLE_CLIENT_ID',
		testDefault: 'test-google-client-id.apps.googleusercontent.com',
		valid: 'real-client-id.apps.googleusercontent.com',
	},
	{ name: 'GOOGLE_CLIENT_SECRET', testDefault: 'test-google-client-secret', valid: 'real-client-secret' },
] as const;

const VALID_SOURCE = Object.fromEntries(VARIABLES.map(({ name, valid }) => [name, valid]));

const asSource = (env: Record<string, string>) => env as unknown as NodeJS.ProcessEnv;
const without = (name: string) => Object.fromEntries(Object.entries(VALID_SOURCE).filter(([key]) => key !== name));

describe('parseGoogleAuthEnv', () => {
	describe.each(VARIABLES)('$name', ({ name, testDefault, valid }) => {
		describe.each(REQUIRING_ENVS)('in "%s"', (nodeEnv: NodeEnv) => {
			it('rejects an absent value', () => {
				expect(() => parseGoogleAuthEnv(asSource(without(name)), nodeEnv)).toThrow();
			});

			it('rejects an empty value', () => {
				expect(() => parseGoogleAuthEnv(asSource({ ...VALID_SOURCE, [name]: '' }), nodeEnv)).toThrow();
			});

			it('accepts a non-empty value', () => {
				expect(parseGoogleAuthEnv(asSource(VALID_SOURCE), nodeEnv)[name]).toBe(valid);
			});
		});

		describe.each(DEFAULTING_ENVS)('in "%s"', (nodeEnv: NodeEnv) => {
			it('applies the placeholder default when absent', () => {
				expect(parseGoogleAuthEnv(asSource({}), nodeEnv)[name]).toBe(testDefault);
			});

			it('still honors an explicit value', () => {
				expect(parseGoogleAuthEnv(asSource(VALID_SOURCE), nodeEnv)[name]).toBe(valid);
			});
		});
	});
});
