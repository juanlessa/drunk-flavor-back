import { describe, expect, it } from 'vitest';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { assertCurrentSessionVersion } from './SessionVersion.policy';

describe('assertCurrentSessionVersion', () => {
	it('accepts an equal integer version', () => {
		expect(() => assertCurrentSessionVersion({ sessionVersion: 3 }, 3, 'test')).not.toThrow();
	});

	it.each([undefined, null, 3.5, '3', 2, 4])('rejects a non-current version value: %s', (version) => {
		expect(() => assertCurrentSessionVersion({ sessionVersion: 3 }, version, 'test')).toThrow(SessionRevokedError);
	});
});
