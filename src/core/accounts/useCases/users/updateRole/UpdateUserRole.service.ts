import { UpdateUserRole } from './updateUserRole.dtos';
import {
	AdministrativeEventActions,
	AdministrativeEventOrigins,
} from '@/core/accounts/entities/administrativeEvent.entity';
import { UserAdministrationPolicy, UserRoleChangeOutcomes } from '@/core/accounts/policies/UserAdministration.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { authorizeUserAdministration, resolveAdministrativeEventContext } from '../userAdministrationAudit.helpers';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class UpdateUserRoleService {
	constructor(
		private usersRepository: IUsersRepository,
		private transactionManager: ITransactionManager,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ userId, role, actor, administrativeContext }: UpdateUserRole): Promise<void> {
		const eventContext = resolveAdministrativeEventContext(administrativeContext);

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
			const currentActor = toAdministrationActor(persistedActor);
			const outcome = authorizeUserAdministration(
				{
					action: 'user.change_role',
					actorId: currentActor.id,
					targetUserId: target.id,
					requestedRole: role,
					context: eventContext,
				},
				() => this.userAdministrationPolicy.assertCanChangeRole(currentActor, target, role),
			);
			if (outcome === UserRoleChangeOutcomes.noop) {
				return;
			}

			await this.usersRepository.update({
				id: userId,
				role,
				sessionVersion: target.sessionVersion + 1,
			});
			await this.administrativeEventsRepository.create({
				actorId: currentActor.id,
				targetUserId: target.id,
				action: AdministrativeEventActions.userRoleChanged,
				before: { role: target.role },
				after: { role },
				...eventContext,
			});
		});
	}
}
