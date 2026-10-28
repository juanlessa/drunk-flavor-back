import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { OwnershipTransferInvitationNotFoundError } from '@/core/accounts/errors/ownershipTransfer.errors';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IOwnershipTransferInvitationsRepository } from '@/core/accounts/repositories/IOwnershipTransferInvitations.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { env } from '@/env';
import { Roles } from '@/shared/accessControl/roles';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { findRequiredAdministrationUser, toAdministrationActor } from '../../users/userAdministration.helpers';
import { resolveAdministrativeEventContext } from '../../users/userAdministrationAudit.helpers';
import {
	assertEligibleOwnershipTarget,
	createOwnershipTransferExpiration,
	enqueueOwnershipTransferInvitation,
} from '../ownershipTransfer.helpers';
import { ResendOwnershipTransfer } from './resendOwnershipTransfer.dtos';

export class ResendOwnershipTransferService {
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
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ actor, administrativeContext }: ResendOwnershipTransfer): Promise<void> {
		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		const tokenHash = this.cryptoProvider.hashToken(token);
		const context = resolveAdministrativeEventContext(administrativeContext);

		const target = await this.transactionManager.withTransaction(async () => {
			const invitation = await this.invitationsRepository.findSingleton();
			if (!invitation) {
				throw new OwnershipTransferInvitationNotFoundError({
					path: 'ResendOwnershipTransfer.service.invitation',
				});
			}
			const currentOwner = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'ResendOwnershipTransfer.service.owner',
			);
			if (
				currentOwner.id !== invitation.currentOwnerId ||
				currentOwner.role !== Roles.owner ||
				currentOwner.status !== UserStatuses.active
			) {
				throw new OwnershipTransferInvitationNotFoundError({
					path: 'ResendOwnershipTransfer.service.owner',
				});
			}
			const targetUser = await findRequiredAdministrationUser(
				this.usersRepository,
				invitation.targetUserId,
				'ResendOwnershipTransfer.service.target',
			);
			this.userAdministrationPolicy.assertCanTransferOwnership(toAdministrationActor(currentOwner), targetUser);
			await assertEligibleOwnershipTarget(
				targetUser,
				this.credentialsRepository,
				this.identitiesRepository,
				'ResendOwnershipTransfer.service.target',
			);

			await this.invitationsRepository.update({
				id: invitation.id,
				tokenHash,
				ownerSessionVersion: currentOwner.sessionVersion,
				targetSessionVersion: targetUser.sessionVersion,
				expiresAt: createOwnershipTransferExpiration(this.dateProvider),
			});
			await this.administrativeEventsRepository.create({
				actorId: currentOwner.id,
				targetUserId: targetUser.id,
				action: AdministrativeEventActions.ownershipTransferResent,
				before: { role: targetUser.role, status: targetUser.status },
				reason: invitation.reason,
				...context,
			});
			return targetUser;
		});

		await enqueueOwnershipTransferInvitation(target, token, this.templateProvider, this.emailQueueProvider);
	}
}
