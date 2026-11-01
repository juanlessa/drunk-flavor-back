import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { User } from '@/core/accounts/entities/user.entity';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';

/** Statuses that may hold an authenticated session; any other status means the session is revoked. */
export const hasUsableSessionStatus = (status: User['status']): boolean =>
	status === UserStatuses.active || status === UserStatuses.incomplete_profile;

export const assertCurrentSessionVersion = (
	user: Pick<User, 'sessionVersion'>,
	presentedVersion: unknown,
	path: string,
): void => {
	if (!Number.isInteger(presentedVersion) || presentedVersion !== user.sessionVersion) {
		throw new SessionRevokedError({ path });
	}
};
