import { OWNERSHIP_TRANSFER_INVITATION_SCOPE } from '@/core/accounts/constants/ownershipTransfer.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import {
	OwnershipTransferAlreadyPendingError,
	OwnershipTransferInvalidError,
} from '@/core/accounts/errors/ownershipTransfer.errors';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
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
import { findRequiredAdministrationUser, toAdministrationActor } from '../../users/userAdministration.helpers';
import { resolveAdministrativeEventContext } from '../../users/userAdministrationAudit.helpers';
import {
	assertEligibleOwnershipTarget,
	createOwnershipTransferExpiration,
	enqueueOwnershipTransferInvitation,
} from '../ownershipTransfer.helpers';
import { RequestOwnershipTransfer } from './requestOwnershipTransfer.dtos';
import { env } from '@/env';

export class RequestOwnershipTransferService {
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

	async execute({ targetUserId, reason, actor, administrativeContext }: RequestOwnershipTransfer): Promise<void> {
		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		const tokenHash = this.cryptoProvider.hashToken(token);
		const context = resolveAdministrativeEventContext(administrativeContext);

		const target = await this.transactionManager.withTransaction(async () => {
			const currentOwner = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'RequestOwnershipTransfer.service.owner',
			);
			const persistedOwner = await this.usersRepository.findByRole(Roles.owner);
			if (
				!persistedOwner ||
				persistedOwner.id !== currentOwner.id ||
				currentOwner.status !== UserStatuses.active
			) {
				throw new OwnershipTransferInvalidError({
					path: 'RequestOwnershipTransfer.service.owner',
					cause: 'Actor is not the current active owner',
				});
			}

			const targetUser = await findRequiredAdministrationUser(
				this.usersRepository,
				targetUserId,
				'RequestOwnershipTransfer.service.target',
			);
			this.userAdministrationPolicy.assertCanTransferOwnership(toAdministrationActor(currentOwner), targetUser);
			await assertEligibleOwnershipTarget(
				targetUser,
				this.credentialsRepository,
				this.identitiesRepository,
				'RequestOwnershipTransfer.service.target',
			);

			const existingInvitation = await this.invitationsRepository.findSingleton();
			if (existingInvitation) {
				if (!this.dateProvider.isExpiredDate(existingInvitation.expiresAt)) {
					throw new OwnershipTransferAlreadyPendingError({
						path: 'RequestOwnershipTransfer.service.pending',
					});
				}
				await this.invitationsRepository.delete(existingInvitation.id);
			}

			await this.invitationsRepository.create({
				scope: OWNERSHIP_TRANSFER_INVITATION_SCOPE,
				currentOwnerId: currentOwner.id,
				targetUserId: targetUser.id,
				tokenHash,
				reason,
				ownerSessionVersion: currentOwner.sessionVersion,
				targetSessionVersion: targetUser.sessionVersion,
				expiresAt: createOwnershipTransferExpiration(this.dateProvider),
			});
			await this.administrativeEventsRepository.create({
				actorId: currentOwner.id,
				targetUserId: targetUser.id,
				action: AdministrativeEventActions.ownershipTransferRequested,
				before: { role: targetUser.role, status: targetUser.status },
				reason,
				...context,
			});
			return targetUser;
		});

		await enqueueOwnershipTransferInvitation(target, token, this.templateProvider, this.emailQueueProvider);
	}
}
