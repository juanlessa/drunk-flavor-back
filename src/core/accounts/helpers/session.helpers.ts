import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { assertCurrentSessionVersion, hasUsableSessionStatus } from '@/core/accounts/policies/SessionVersion.policy';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';

/**
 * Authoritative session check: the persisted user must exist, hold a usable status, and match the presented
 * session version. Returns the persisted session so callers act on current role and status.
 */
export const loadCurrentSession = async (
	usersRepository: IUsersRepository,
	session: Pick<AuthenticatedSession, 'id' | 'sessionVersion'>,
	path: string,
): Promise<AuthenticatedSession> => {
	const user = await usersRepository.findById(session.id);
	if (!user || !hasUsableSessionStatus(user.status)) {
		throw new SessionRevokedError({ path, cause: 'The session user is missing or inactive' });
	}
	assertCurrentSessionVersion(user, session.sessionVersion, path);

	return { id: user.id, role: user.role, status: user.status, sessionVersion: user.sessionVersion };
};
