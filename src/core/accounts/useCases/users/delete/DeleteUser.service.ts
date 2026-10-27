import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { DeleteUser } from './deleteUser.dtos';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class DeleteUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, actor }: DeleteUser): Promise<void> {
		await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'DeleteUser.service.actor',
			);
			const target = await findRequiredAdministrationUser(this.usersRepository, id, 'DeleteUser.service.target');
			this.userAdministrationPolicy.assertCanDeleteUser(toAdministrationActor(persistedActor), target);

			await this.usersRepository.delete(id);
			await this.credentialsRepository.deleteByUserId(id);
			await this.identitiesRepository.deleteByUserId(id);
			await this.tokensRepository.deleteByUserId(id);
		});
		// TODO: Enqueue engagement cleanup for comments and ratings by user id.
	}
}
