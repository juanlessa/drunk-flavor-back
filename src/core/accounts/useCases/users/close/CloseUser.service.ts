import { AdministrativeEventOrigins } from '@/core/accounts/constants/administrativeEvent.constants';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ICleanupQueueProvider } from '@/shared/providers/queue/cleanup/ICleanupQueue.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { deleteAccountData, enqueueAccountClosureCleanup } from '@/core/accounts/helpers/accountClosure.helpers';
import { authorizeUserAdministration } from '@/core/accounts/helpers/userAdministrationAudit.helpers';
import {
	findRequiredAdministrationUser,
	toAdministrationActor,
} from '@/core/accounts/helpers/userAdministration.helpers';
import { CloseUserCommand } from './closeUser.dtos';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';

export class CloseUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private tokensRepository: ITokensRepository,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private transactionManager: ITransactionManager,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
		private cleanupQueueProvider: ICleanupQueueProvider,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, reason, actor, administrativeContext }: CloseUserCommand): Promise<void> {
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
				sessionVersionMarkerStore: this.sessionVersionMarkerStore,
			});
			return target;
		});

		await enqueueAccountClosureCleanup(closedUser, this.cleanupQueueProvider);
	}
}
