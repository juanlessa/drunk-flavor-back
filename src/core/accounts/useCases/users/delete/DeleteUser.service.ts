import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { DeleteUser } from './deleteUser.dtos';
import { authorizeUserAdministration, resolveAdministrativeEventContext } from '../userAdministrationAudit.helpers';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class DeleteUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, actor, administrativeContext }: DeleteUser): Promise<void> {
		const eventContext = resolveAdministrativeEventContext(administrativeContext);

		await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'DeleteUser.service.actor',
			);
			const target = await findRequiredAdministrationUser(this.usersRepository, id, 'DeleteUser.service.target');
			const currentActor = toAdministrationActor(persistedActor);
			authorizeUserAdministration(
				{
					action: 'user.delete',
					actorId: currentActor.id,
					targetUserId: target.id,
					context: eventContext,
				},
				() => this.userAdministrationPolicy.assertCanDeleteUser(currentActor, target),
			);

			await this.usersRepository.delete(id);
			await this.credentialsRepository.deleteByUserId(id);
			await this.identitiesRepository.deleteByUserId(id);
			await this.tokensRepository.deleteByUserId(id);
			await this.administrativeEventsRepository.create({
				actorId: currentActor.id,
				targetUserId: target.id,
				action: AdministrativeEventActions.userDeleted,
				before: { role: target.role, status: target.status },
				...eventContext,
			});
		});
		// TODO: Enqueue engagement cleanup for comments and ratings by user id.
	}
}
