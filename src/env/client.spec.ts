import { describe, expect, it } from 'vitest';
import { parseClientEnv } from './client';

describe('parseClientEnv', () => {
	it('requires CLIENT_BASE_URL in production', () => {
		expect(() => parseClientEnv({ CLIENT_BASE_URL: undefined } as NodeJS.ProcessEnv, 'production')).toThrow();
	});

	it.each(['development', 'testing', 'e2e', 'production'] as const)(
		'accepts a valid bare origin in "%s" environment',
		(nodeEnv) => {
			const result = parseClientEnv({ CLIENT_BASE_URL: 'https://app.example.com' }, nodeEnv);
			expect(result.CLIENT_BASE_URL).toBe('https://app.example.com');
		},
	);

	it.each(['development', 'testing', 'e2e'] as const)(
		'defaults to http://localhost:3000 in the "%s" environment',
		(nodeEnv) => {
			const result = parseClientEnv({} as NodeJS.ProcessEnv, nodeEnv);
			expect(result.CLIENT_BASE_URL).toBe('http://localhost:3000');
		},
	);

	it.each(['development', 'testing', 'e2e', 'production'] as const)(
		'rejects a non-http protocol in the "%s" environment',
		(nodeEnv) => {
			expect(() => parseClientEnv({ CLIENT_BASE_URL: 'ftp://app.example.com' }, nodeEnv)).toThrow();
		},
	);

	it.each(['development', 'testing', 'e2e'] as const)(
		'rejects a value that is not a bare origin in the "%s" environment',
		(nodeEnv) => {
			expect(() => parseClientEnv({ CLIENT_BASE_URL: 'https://app.example.com/path' }, nodeEnv)).toThrow();
			expect(() => parseClientEnv({ CLIENT_BASE_URL: 'https://app.example.com/' }, nodeEnv)).toThrow();
		},
	);
});
