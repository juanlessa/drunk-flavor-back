import { UserStatuses } from '@/core/accounts/constants/user.constants';
import {
	AdministrativeEventActions,
	AdministrativeEventContext,
} from '@/core/accounts/entities/administrativeEvent.entity';
import { User } from '@/core/accounts/entities/user.entity';
import { UserStatusTransitionInvalidError } from '@/core/accounts/errors/user.errors';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { getManagedStoredFileName } from '@/shared/helpers/file.helpers';
import { IEngagementModule } from '@/core/engagement/public';
import { logger } from '@/shared/providers/logger';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';

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
	engagementModule: IEngagementModule;
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
	engagementModule,
}: DeleteAccountDataOptions): Promise<void> => {
	await engagementModule.deleteCommentsByUser(user.id);
	await credentialsRepository.deleteByUserId(user.id);
	await identitiesRepository.deleteByUserId(user.id);
	await tokensRepository.deleteByUserId(user.id);
	await usersRepository.delete(user.id);
	await administrativeEventsRepository.create({
		actorId,
		targetUserId: user.id,
		action: AdministrativeEventActions.userClosed,
		before: { role: user.role, status: user.status },
		...context,
		...(reason !== undefined ? { reason } : {}),
	});
};

export const deleteAccountAvatar = async (user: User, storageProvider: IStorageProvider): Promise<void> => {
	const avatarName = getManagedStoredFileName(user.avatarUrl, user.id, 'avatar');
	if (!avatarName) {
		return;
	}

	try {
		await storageProvider.deleteFile(avatarName);
	} catch (error) {
		logger.error(error, 'Unable to delete the account avatar after account closure');
	}
};
