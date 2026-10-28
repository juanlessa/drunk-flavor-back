import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { UserAdministrationPolicy, UserStatusChangeOutcomes } from '@/core/accounts/policies/UserAdministration.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { ReactivateUser } from './reactivateUser.dtos';
import { authorizeUserAdministration, resolveAdministrativeEventContext } from '../userAdministrationAudit.helpers';
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

export class ReactivateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private transactionManager: ITransactionManager,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, reason, actor, administrativeContext }: ReactivateUser): Promise<void> {
		const eventContext = resolveAdministrativeEventContext(administrativeContext);

		await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'ReactivateUser.service.actor',
			);
			const target = await findRequiredAdministrationUser(
				this.usersRepository,
				id,
				'ReactivateUser.service.target',
			);
			const currentActor = toAdministrationActor(persistedActor);
			const outcome = authorizeUserAdministration(
				{
					action: 'user.reactivate',
					actorId: currentActor.id,
					targetUserId: target.id,
					context: eventContext,
				},
				() => this.userAdministrationPolicy.assertCanReactivateUser(currentActor, target),
			);
			if (outcome === UserStatusChangeOutcomes.noop) {
				return;
			}

			await this.usersRepository.update({
				id: target.id,
				status: UserStatuses.active,
				sessionVersion: target.sessionVersion + 1,
			});
			await this.administrativeEventsRepository.create({
				actorId: currentActor.id,
				targetUserId: target.id,
				action: AdministrativeEventActions.userReactivated,
				before: { status: target.status },
				after: { status: UserStatuses.active },
				...eventContext,
				reason,
			});
		});
	}
}
