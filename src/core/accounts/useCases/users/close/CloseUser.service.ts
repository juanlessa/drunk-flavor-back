import { AdministrativeEventOrigins } from '@/core/accounts/entities/administrativeEvent.entity';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IEngagementModule } from '@/core/engagement/public';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { deleteAccountAvatar, deleteAccountData } from '@/core/accounts/useCases/accountClosure/accountClosure.helpers';
import { authorizeUserAdministration } from '../userAdministrationAudit.helpers';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';
import { CloseUser } from './closeUser.dtos';

export class CloseUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private tokensRepository: ITokensRepository,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private engagementModule: IEngagementModule,
		private transactionManager: ITransactionManager,
		private storageProvider: IStorageProvider,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, reason, actor, administrativeContext }: CloseUser): Promise<void> {
		const context = administrativeContext ?? { origin: AdministrativeEventOrigins.api };
		const closedUser = await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'CloseUser.service.actor',
			);
			const target = await findRequiredAdministrationUser(this.usersRepository, id, 'CloseUser.service.target');
			const currentActor = toAdministrationActor(persistedActor);
			authorizeUserAdministration(
				{
					action: 'user.close',
					actorId: currentActor.id,
					targetUserId: target.id,
					context,
				},
				() => this.userAdministrationPolicy.assertCanCloseUser(currentActor, target),
			);

			await deleteAccountData({
				user: target,
				actorId: currentActor.id,
				reason,
				context,
				usersRepository: this.usersRepository,
				credentialsRepository: this.credentialsRepository,
				identitiesRepository: this.identitiesRepository,
				tokensRepository: this.tokensRepository,
				administrativeEventsRepository: this.administrativeEventsRepository,
				engagementModule: this.engagementModule,
			});
			return target;
		});

		await deleteAccountAvatar(closedUser, this.storageProvider);
	}
}
