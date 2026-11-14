import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { OwnerManagementRequiresTransferError } from '@/core/accounts/errors/user.errors';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import {
	assertAccountCanBeSelfClosed,
	deleteAccountData,
	enqueueAccountClosureCleanup,
} from '@/core/accounts/helpers/accountClosure.helpers';
import { NotFoundError } from '@/shared/error/error.lib';
import { ICleanupQueueProvider } from '@/shared/providers/queue/cleanup/ICleanupQueue.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { Roles } from '@/shared/accessControl/roles';
import { DeleteProfileCommand } from './deleteProfile.dtos';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';

export class DeleteProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
		private cleanupQueueProvider: ICleanupQueueProvider,
	) {}

	async execute({ id, administrativeContext }: DeleteProfileCommand): Promise<void> {
		const context = administrativeContext ?? { origin: AdministrativeEventOrigins.api };
		const closedUser = await this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(id);
			if (!user) {
				throw new NotFoundError('apiResponses.users.notFound', { path: 'DeleteProfile.service' });
			}
			if (user.role === Roles.owner) {
				throw new OwnerManagementRequiresTransferError({ path: 'DeleteProfile.service' });
			}
			assertAccountCanBeSelfClosed(user, 'DeleteProfile.service.status');

			await deleteAccountData({
				user,
				actorId: user.id,
				context,
				usersRepository: this.usersRepository,
				credentialsRepository: this.credentialsRepository,
				identitiesRepository: this.identitiesRepository,
				tokensRepository: this.tokensRepository,
				administrativeEventsRepository: this.administrativeEventsRepository,
				sessionVersionMarkerStore: this.sessionVersionMarkerStore,
			});
			return user;
		});

		await enqueueAccountClosureCleanup(closedUser, this.cleanupQueueProvider);
	}
}
