import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { AdministrativeEventContext } from '@/core/accounts/entities/administrativeEvent.entity';
import { User } from '@/core/accounts/entities/user.entity';
import { UserStatusTransitionInvalidError } from '@/core/accounts/errors/user.errors';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { invalidateDeletedUserSessions } from '@/core/accounts/helpers/sessionInvalidation.helpers';
import { getManagedStoredFileName } from '@/shared/helpers/file.helpers';
import { logger } from '@/shared/providers/logger';
import {
	clearCatalogAuthorshipJob,
	deleteCommentsJob,
	deleteStorageFileJob,
} from '@/shared/providers/queue/cleanup/cleanupJobs';
import { enqueueCleanupJobs } from '@/shared/providers/queue/cleanup/enqueueCleanupJobs.helpers';
import { ICleanupQueueProvider } from '@/shared/providers/queue/cleanup/ICleanupQueue.provider';

const closableStatuses: readonly User['status'][] = [
	UserStatuses.active,
	UserStatuses.suspended,
	UserStatuses.incomplete_profile,
];

export const assertAccountCanBeSelfClosed = (user: User, path: string): void => {
	if (!closableStatuses.includes(user.status)) {
		throw new UserStatusTransitionInvalidError({ path });
	}
};

type DeleteAccountDataOptions = {
	user: User;
	actorId: string;
	reason?: string;
	context: AdministrativeEventContext;
	usersRepository: IUsersRepository;
	credentialsRepository: ICredentialsRepository;
	identitiesRepository: IIdentitiesRepository;
	tokensRepository: ITokensRepository;
	administrativeEventsRepository: IAdministrativeEventsRepository;
	sessionVersionMarkerStore: ISessionVersionMarkerStore;
};

export const deleteAccountData = async ({
	user,
	actorId,
	reason,
	context,
	usersRepository,
	credentialsRepository,
	identitiesRepository,
	tokensRepository,
	administrativeEventsRepository,
	sessionVersionMarkerStore,
}: DeleteAccountDataOptions): Promise<void> => {
	await credentialsRepository.deleteByUserId(user.id);
	await identitiesRepository.deleteByUserId(user.id);
	await tokensRepository.deleteByUserId(user.id);
	await usersRepository.delete(user.id);
	await invalidateDeletedUserSessions(sessionVersionMarkerStore, user);
	await administrativeEventsRepository.create({
		actorId,
		targetUserId: user.id,
		action: AdministrativeEventActions.userClosed,
		before: { role: user.role, status: user.status },
		...context,
		...(reason !== undefined ? { reason } : {}),
	});
};

/**
 * Enqueues the cleanup that must follow an account closure but does not need to finish before the
 * response: detaching the user from the catalog (the catalog they contributed to is kept, without
 * the user as its creator, because the account holds the personal data), deleting their comments
 * and removing their stored avatar.
 *
 * Runs after the closure transaction has committed, so a rolled-back closure never schedules cleanup.
 */
export const enqueueAccountClosureCleanup = async (
	user: User,
	cleanupQueueProvider: ICleanupQueueProvider,
): Promise<void> => {
	const avatarName = getManagedStoredFileName(user.avatarUrl, user.id, 'avatar');
	await enqueueCleanupJobs(
		cleanupQueueProvider,
		[
			clearCatalogAuthorshipJob(user.id),
			deleteCommentsJob(user.id),
			...(avatarName ? [deleteStorageFileJob(avatarName)] : []),
		],
		{ userId: user.id },
	);
};
