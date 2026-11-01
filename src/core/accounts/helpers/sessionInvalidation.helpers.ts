import { User } from '@/core/accounts/entities/user.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';

/*
 * Single entry points for invalidating a user's sessions.
 *
 * The persisted `sessionVersion` (Mongo) is the source of truth; the marker store only tells the authentication
 * layer that unexpired access tokens may be stale. Call these helpers inside the use case transaction:
 * - a marker failure throws and aborts the transaction (fail-closed), so a committed invalidation always has a
 *   marker;
 * - a marker raised for a transaction that later aborts is harmless, because a marker only forces an
 *   authoritative lookup. This is why the dual write does not need a transactional outbox.
 */

export const invalidateUserSessions = async (
	usersRepository: IUsersRepository,
	sessionVersionMarkerStore: ISessionVersionMarkerStore,
	userId: string,
): Promise<User> => {
	const user = await usersRepository.incrementSessionVersion(userId);
	await sessionVersionMarkerStore.raise(user.id, user.sessionVersion);
	return user;
};

/** For deleted users: no persisted version can satisfy the marker, so every token hits the user store. */
export const invalidateDeletedUserSessions = async (
	sessionVersionMarkerStore: ISessionVersionMarkerStore,
	user: Pick<User, 'id' | 'sessionVersion'>,
): Promise<void> => {
	await sessionVersionMarkerStore.raise(user.id, user.sessionVersion + 1);
};
