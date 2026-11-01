import {
	AdministrativeEventActions,
	AdministrativeEventOrigins,
} from '@/core/accounts/constants/administrativeEvent.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { SessionRevokedError } from '@/core/accounts/errors/session.errors';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { assertCurrentSessionVersion } from '@/core/accounts/policies/SessionVersion.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import {
	findRequiredAdministrationUser,
	toAdministrationActor,
} from '@/core/accounts/helpers/userAdministration.helpers';
import { authorizeUserAdministration } from '@/core/accounts/helpers/userAdministrationAudit.helpers';
import { RevokeUserSessions } from './revokeUserSessions.dtos';
import { enqueueUserSessionsRevokedBestEffort } from '@/core/accounts/helpers/revokeUserSessionsNotification.helpers';

export class RevokeUserSessionsService {
	constructor(
		private usersRepository: IUsersRepository,
		private transactionManager: ITransactionManager,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private templateProvider: ITemplateProvider,
		private emailQueueProvider: IEmailQueueProvider,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ id, reason, actor, administrativeContext }: RevokeUserSessions): Promise<void> {
		const eventContext = administrativeContext ?? { origin: AdministrativeEventOrigins.api };
		const updatedTarget = await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'RevokeUserSessions.service.actor',
			);
			if (persistedActor.status !== UserStatuses.active) {
				throw new SessionRevokedError({
					path: 'RevokeUserSessions.service.actorSession',
					cause: 'The session user is inactive',
				});
			}
			assertCurrentSessionVersion(
				persistedActor,
				actor.sessionVersion,
				'RevokeUserSessions.service.actorSession',
			);

			const target = await findRequiredAdministrationUser(
				this.usersRepository,
				id,
				'RevokeUserSessions.service.target',
			);
			const currentActor = toAdministrationActor(persistedActor);
			authorizeUserAdministration(
				{
					action: 'user.revoke_sessions',
					actorId: currentActor.id,
					targetUserId: target.id,
					context: eventContext,
				},
				() => this.userAdministrationPolicy.assertCanRevokeUserSessions(currentActor, target),
			);

			const updated = await this.usersRepository.incrementSessionVersion(target.id);
			await this.administrativeEventsRepository.create({
				actorId: currentActor.id,
				targetUserId: target.id,
				action: AdministrativeEventActions.userSessionsRevoked,
				before: { role: target.role, status: target.status },
				after: { role: target.role, status: target.status },
				...eventContext,
				reason,
			});
			return updated;
		});

		await enqueueUserSessionsRevokedBestEffort(updatedTarget, this.templateProvider, this.emailQueueProvider);
	}
}
