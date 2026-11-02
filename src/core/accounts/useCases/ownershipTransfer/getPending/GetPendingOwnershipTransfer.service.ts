import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { findRequiredAdministrationUser } from '@/core/accounts/helpers/userAdministration.helpers';
import { IOwnershipTransferInvitationsRepository } from '@/core/accounts/repositories/IOwnershipTransferInvitations.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { Roles } from '@/shared/accessControl/roles';
import { GetPendingOwnershipTransfer, PendingOwnershipTransfer } from './getPendingOwnershipTransfer.dtos';

export class GetPendingOwnershipTransferService {
	constructor(
		private usersRepository: IUsersRepository,
		private invitationsRepository: IOwnershipTransferInvitationsRepository,
	) {}

	/**
	 * Returns the invitation the current owner can resend or cancel, or `null` when there is none.
	 * An invitation is hidden from any actor other than the active owner who created it, matching resend and cancel.
	 * Expired invitations are still returned so the owner can resend or cancel them.
	 */
	async execute({ actor }: GetPendingOwnershipTransfer): Promise<PendingOwnershipTransfer | null> {
		const invitation = await this.invitationsRepository.findSingleton();
		if (!invitation) return null;

		const currentOwner = await findRequiredAdministrationUser(
			this.usersRepository,
			actor.id,
			'GetPendingOwnershipTransfer.service.owner',
		);
		if (
			currentOwner.id !== invitation.currentOwnerId ||
			currentOwner.role !== Roles.owner ||
			currentOwner.status !== UserStatuses.active
		) {
			return null;
		}

		return {
			targetUserId: invitation.targetUserId,
			reason: invitation.reason,
			expiresAt: invitation.expiresAt,
		};
	}
}
