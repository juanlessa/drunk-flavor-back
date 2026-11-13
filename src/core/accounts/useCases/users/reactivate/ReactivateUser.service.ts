import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/constants/administrativeEvent.constants';
import { UserAdministrationPolicy, UserStatusChangeOutcomes } from '@/core/accounts/policies/UserAdministration.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { ReactivateUserCommand } from './reactivateUser.dtos';
import {
	authorizeUserAdministration,
	resolveAdministrativeEventContext,
} from '@/core/accounts/helpers/userAdministrationAudit.helpers';
import {
	findRequiredAdministrationUser,
	toAdministrationActor,
} from '@/core/accounts/helpers/userAdministration.helpers';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { invalidateUserSessions } from '@/core/accounts/helpers/sessionInvalidation.helpers';

export class ReactivateUserService {
	constructor(
		private usersRepository: IUsersRepository,
		private transactionManager: ITransactionManager,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, reason, actor, administrativeContext }: ReactivateUserCommand): Promise<void> {
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

			await this.usersRepository.update({ id: target.id, status: UserStatuses.active });
			await invalidateUserSessions(this.usersRepository, this.sessionVersionMarkerStore, target.id);
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
