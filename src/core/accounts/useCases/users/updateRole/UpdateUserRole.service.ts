import { UpdateUserRole } from '@/core/accounts/dtos/user.dtos';
import { UserAdministrationPolicy, UserRoleChangeOutcomes } from '@/core/accounts/policies/UserAdministration.policy';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class UpdateUserRoleService {
	constructor(
		private usersRepository: IUsersRepository,
		private transactionManager: ITransactionManager,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ userId, role, actor }: UpdateUserRole): Promise<void> {
		await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'UpdateUserRole.service.actor',
			);
			const target = await findRequiredAdministrationUser(
				this.usersRepository,
				userId,
				'UpdateUserRole.service.target',
			);

			const outcome = this.userAdministrationPolicy.assertCanChangeRole(
				toAdministrationActor(persistedActor),
				target,
				role,
			);
			if (outcome === UserRoleChangeOutcomes.noop) {
				return;
			}

			await this.usersRepository.update({ id: userId, role });
		});
	}
}
