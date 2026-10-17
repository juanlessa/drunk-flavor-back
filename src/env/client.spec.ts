import { describe, expect, it } from 'vitest';
import { parseClientEnv } from './client';

describe('parseClientEnv', () => {
	it('requires CLIENT_BASE_URL in production', () => {
		expect(() => parseClientEnv({ CLIENT_BASE_URL: undefined } as NodeJS.ProcessEnv, 'production')).toThrow();
	});

	it('accepts a valid bare origin in production', () => {
		const result = parseClientEnv({ CLIENT_BASE_URL: 'https://app.example.com' }, 'production');
		expect(result.CLIENT_BASE_URL).toBe('https://app.example.com');
	});

	it.each(['development', 'testing', 'e2e'] as const)(
		'defaults to http://localhost:3000 in the "%s" environment',
		(nodeEnv) => {
			const result = parseClientEnv({} as NodeJS.ProcessEnv, nodeEnv);
			expect(result.CLIENT_BASE_URL).toBe('http://localhost:3000');
		},
	);

	it('rejects a non-http protocol', () => {
		expect(() => parseClientEnv({ CLIENT_BASE_URL: 'ftp://app.example.com' }, 'production')).toThrow();
	});

	it('rejects a value that is not a bare origin', () => {
		expect(() => parseClientEnv({ CLIENT_BASE_URL: 'https://app.example.com/path' }, 'production')).toThrow();
		expect(() => parseClientEnv({ CLIENT_BASE_URL: 'https://app.example.com/' }, 'production')).toThrow();
	});
});
