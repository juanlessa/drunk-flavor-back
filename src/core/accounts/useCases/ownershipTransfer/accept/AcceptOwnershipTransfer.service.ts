import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { User } from '@/core/accounts/entities/user.entity';
import { OwnershipTransferInvalidError } from '@/core/accounts/errors/ownershipTransfer.errors';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IOwnershipTransferInvitationsRepository } from '@/core/accounts/repositories/IOwnershipTransferInvitations.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { findRequiredAdministrationUser } from '../../users/userAdministration.helpers';
import { resolveAdministrativeEventContext } from '../../users/userAdministrationAudit.helpers';
import {
	assertEligibleOwnershipTarget,
	assertOwnershipTransferInvitationCurrent,
	enqueueOwnershipTransferChangedBestEffort,
} from '../ownershipTransfer.helpers';
import { AcceptOwnershipTransfer } from './acceptOwnershipTransfer.dtos';

type OwnershipTransferResult = {
	previousOwner: User;
	newOwner: User;
};

export class AcceptOwnershipTransferService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private invitationsRepository: IOwnershipTransferInvitationsRepository,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private cryptoProvider: ICryptoProvider,
		private dateProvider: IDateProvider,
		private transactionManager: ITransactionManager,
		private templateProvider: ITemplateProvider,
		private emailQueueProvider: IEmailQueueProvider,
	) {}

	async execute({ token, actor, administrativeContext }: AcceptOwnershipTransfer): Promise<void> {
		const tokenHash = this.cryptoProvider.hashToken(token);
		const context = resolveAdministrativeEventContext(administrativeContext);

		const result = await this.transactionManager.withTransaction<OwnershipTransferResult>(async () => {
			const invitation = await this.invitationsRepository.findByTokenHash(tokenHash);
			if (!invitation) {
				throw new OwnershipTransferInvalidError({ path: 'AcceptOwnershipTransfer.service.invitation' });
			}
			assertOwnershipTransferInvitationCurrent(
				invitation,
				this.dateProvider,
				'AcceptOwnershipTransfer.service.expiration',
			);
			if (actor.id !== invitation.targetUserId) {
				throw new OwnershipTransferInvalidError({
					path: 'AcceptOwnershipTransfer.service.actor',
					cause: 'Invitation target does not match authenticated actor',
				});
			}

			const previousOwner = await findRequiredAdministrationUser(
				this.usersRepository,
				invitation.currentOwnerId,
				'AcceptOwnershipTransfer.service.owner',
			);
			const newOwner = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'AcceptOwnershipTransfer.service.target',
			);
			const persistedOwner = await this.usersRepository.findByRole(Roles.owner);
			if (
				!persistedOwner ||
				persistedOwner.id !== previousOwner.id ||
				previousOwner.role !== Roles.owner ||
				previousOwner.status !== UserStatuses.active ||
				previousOwner.sessionVersion !== invitation.ownerSessionVersion ||
				newOwner.sessionVersion !== invitation.targetSessionVersion
			) {
				throw new OwnershipTransferInvalidError({
					path: 'AcceptOwnershipTransfer.service.snapshots',
					cause: 'Ownership transfer participants changed after invitation creation',
				});
			}
			await assertEligibleOwnershipTarget(
				newOwner,
				this.credentialsRepository,
				this.identitiesRepository,
				'AcceptOwnershipTransfer.service.target',
			);

			const updatedPreviousOwner = await this.usersRepository.update({
				id: previousOwner.id,
				role: Roles.admin,
				sessionVersion: previousOwner.sessionVersion + 1,
			});
			const updatedNewOwner = await this.usersRepository.update({
				id: newOwner.id,
				role: Roles.owner,
				sessionVersion: newOwner.sessionVersion + 1,
			});
			await this.invitationsRepository.delete(invitation.id);
			await this.administrativeEventsRepository.create({
				actorId: previousOwner.id,
				targetUserId: newOwner.id,
				action: AdministrativeEventActions.ownershipTransferred,
				before: { role: newOwner.role, status: newOwner.status },
				after: { role: Roles.owner, status: newOwner.status },
				reason: invitation.reason,
				...context,
			});
			await this.administrativeEventsRepository.create({
				actorId: previousOwner.id,
				targetUserId: previousOwner.id,
				action: AdministrativeEventActions.userRoleChanged,
				before: { role: Roles.owner, status: previousOwner.status },
				after: { role: Roles.admin, status: previousOwner.status },
				reason: invitation.reason,
				...context,
			});

			return { previousOwner: updatedPreviousOwner, newOwner: updatedNewOwner };
		});

		await Promise.all([
			enqueueOwnershipTransferChangedBestEffort(
				result.previousOwner,
				Roles.admin,
				this.templateProvider,
				this.emailQueueProvider,
			),
			enqueueOwnershipTransferChangedBestEffort(
				result.newOwner,
				Roles.owner,
				this.templateProvider,
				this.emailQueueProvider,
			),
		]);
	}
}
