import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { OwnershipTransferInvitationNotFoundError } from '@/core/accounts/errors/ownershipTransfer.errors';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { IOwnershipTransferInvitationsRepository } from '@/core/accounts/repositories/IOwnershipTransferInvitations.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { findRequiredAdministrationUser } from '../../users/userAdministration.helpers';
import { resolveAdministrativeEventContext } from '../../users/userAdministrationAudit.helpers';
import { CancelOwnershipTransfer } from './cancelOwnershipTransfer.dtos';

export class CancelOwnershipTransferService {
	constructor(
		private usersRepository: IUsersRepository,
		private invitationsRepository: IOwnershipTransferInvitationsRepository,
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ actor, administrativeContext }: CancelOwnershipTransfer): Promise<void> {
		const context = resolveAdministrativeEventContext(administrativeContext);
		await this.transactionManager.withTransaction(async () => {
			const invitation = await this.invitationsRepository.findSingleton();
			if (!invitation) {
				throw new OwnershipTransferInvitationNotFoundError({
					path: 'CancelOwnershipTransfer.service.invitation',
				});
			}
			const currentOwner = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'CancelOwnershipTransfer.service.owner',
			);
			if (
				currentOwner.id !== invitation.currentOwnerId ||
				currentOwner.role !== Roles.owner ||
				currentOwner.status !== UserStatuses.active
			) {
				throw new OwnershipTransferInvitationNotFoundError({
					path: 'CancelOwnershipTransfer.service.owner',
				});
			}

			await this.invitationsRepository.delete(invitation.id);
			await this.administrativeEventsRepository.create({
				actorId: currentOwner.id,
				targetUserId: invitation.targetUserId,
				action: AdministrativeEventActions.ownershipTransferCancelled,
				reason: invitation.reason,
				...context,
			});
		});
	}
}
