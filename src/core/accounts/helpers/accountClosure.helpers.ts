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
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
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
 * Runs after the closure transaction has committed, so a rolled-back closure never schedules
 * cleanup. Each job is enqueued independently and a failure is logged without failing the
 * closure, which has already happened. The jobs are idempotent and deduplicated by user, so
 * enqueueing them again is safe.
 */
export const enqueueAccountClosureCleanup = async (
	user: User,
	cleanupQueueProvider: ICleanupQueueProvider,
): Promise<void> => {
	const userId = user.id;
	const avatarName = getManagedStoredFileName(user.avatarUrl, userId, 'avatar');
	const enqueues: Array<{ jobName: string; enqueue: () => Promise<void> }> = [
		{
			jobName: CLEANUP_JOB_NAMES.clearCatalogAuthorship,
			enqueue: () =>
				cleanupQueueProvider.add(
					CLEANUP_JOB_NAMES.clearCatalogAuthorship,
					{ userId },
					{ deduplicationKey: `clear-catalog-authorship-${userId}` },
				),
		},
		{
			jobName: CLEANUP_JOB_NAMES.deleteComments,
			enqueue: () =>
				cleanupQueueProvider.add(
					CLEANUP_JOB_NAMES.deleteComments,
					{ userId },
					{ deduplicationKey: `delete-comments-${userId}` },
				),
		},
	];
	if (avatarName) {
		enqueues.push({
			jobName: CLEANUP_JOB_NAMES.deleteStorageFile,
			enqueue: () =>
				cleanupQueueProvider.add(
					CLEANUP_JOB_NAMES.deleteStorageFile,
					{ fileName: avatarName },
					{ deduplicationKey: `delete-storage-file-${avatarName}` },
				),
		});
	}
	const results = await Promise.allSettled(enqueues.map(({ enqueue }) => enqueue()));
	results.forEach((result, index) => {
		if (result.status === 'rejected') {
			logger.error(
				{ err: result.reason as unknown, userId, jobName: enqueues[index].jobName },
				'Unable to enqueue account closure cleanup',
			);
		}
	});
};
