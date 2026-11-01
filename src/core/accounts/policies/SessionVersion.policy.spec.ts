import { describe, expect, it } from 'vitest';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { assertCurrentSessionVersion, hasUsableSessionStatus } from './SessionVersion.policy';

describe('SessionVersion policy', () => {
	describe('hasUsableSessionStatus', () => {
		it.each([UserStatuses.active, UserStatuses.incomplete_profile])(
			'allows a %s user to hold a session',
			(status) => {
				expect(hasUsableSessionStatus(status)).toBe(true);
			},
		);

		it.each([UserStatuses.pending, UserStatuses.suspended, UserStatuses.idle])(
			'denies a session to a %s user',
			(status) => {
				expect(hasUsableSessionStatus(status)).toBe(false);
			},
		);
	});

	describe('assertCurrentSessionVersion', () => {
		it('accepts the exact persisted integer version', () => {
			expect(() => assertCurrentSessionVersion({ sessionVersion: 3 }, 3, 'test.current')).not.toThrow();
		});

		it.each([undefined, null, '3', 2, 4, 3.5])('rejects presented version %s', (presentedVersion) => {
			expect(() => assertCurrentSessionVersion({ sessionVersion: 3 }, presentedVersion, 'test.stale')).toThrow(
				SessionRevokedError,
			);
		});
	});
});
