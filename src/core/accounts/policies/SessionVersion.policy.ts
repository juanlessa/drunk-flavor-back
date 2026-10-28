import { User } from '@/core/accounts/entities/user.entity';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';

export const assertCurrentSessionVersion = (
	user: Pick<User, 'sessionVersion'>,
	presentedVersion: unknown,
	path: string,
): void => {
	if (!Number.isInteger(presentedVersion) || presentedVersion !== user.sessionVersion) {
		throw new SessionRevokedError({ path });
	}
};
