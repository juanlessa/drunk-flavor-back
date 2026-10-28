import { OWNERSHIP_TRANSFER_INVITATION_TTL_HOURS } from '@/core/accounts/constants/ownershipTransfer.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { OwnershipTransferInvitation } from '@/core/accounts/entities/ownershipTransferInvitation.entity';
import { User } from '@/core/accounts/entities/user.entity';
import {
	OwnershipTransferInvalidError,
	OwnershipTransferTargetIneligibleError,
} from '@/core/accounts/errors/ownershipTransfer.errors';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { env } from '@/env';
import { CLIENT_PAGE_PATHS } from '@/shared/constants/client.constants';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { Roles } from '@/shared/accessControl/roles';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { logger } from '@/shared/providers/logger';

export const createOwnershipTransferExpiration = (dateProvider: IDateProvider): Date =>
	dateProvider.addHoursToCurrentTime(OWNERSHIP_TRANSFER_INVITATION_TTL_HOURS);

export const assertOwnershipTransferInvitationCurrent = (
	invitation: OwnershipTransferInvitation,
	dateProvider: IDateProvider,
	path: string,
): void => {
	if (dateProvider.isExpiredDate(invitation.expiresAt)) {
		throw new OwnershipTransferInvalidError({ path, cause: 'Ownership transfer invitation has expired' });
	}
};

export const assertEligibleOwnershipTarget = async (
	target: User,
	credentialsRepository: ICredentialsRepository,
	identitiesRepository: IIdentitiesRepository,
	path: string,
): Promise<void> => {
	if (target.role !== Roles.admin || target.status !== UserStatuses.active || !target.emailVerified) {
		throw new OwnershipTransferTargetIneligibleError({ path });
	}

	const hasPassword = await credentialsRepository.existsByUserId(target.id);
	const providers = await identitiesRepository.listProvidersByUserId(target.id);
	if (!hasPassword && providers.length === 0) {
		throw new OwnershipTransferTargetIneligibleError({
			path,
			cause: 'Target administrator has no usable authentication method',
		});
	}
};

export const enqueueOwnershipTransferInvitation = async (
	target: User,
	token: string,
	templateProvider: ITemplateProvider,
	emailQueueProvider: IEmailQueueProvider,
): Promise<void> => {
	const html = await templateProvider.ownershipTransferInvitation({
		userName: target.name ?? 'Administrator',
		acceptanceLink: `${env.CLIENT_BASE_URL}${CLIENT_PAGE_PATHS.ownershipTransfer}/${token}`,
	});
	await emailQueueProvider.add(EMAIL_JOB_NAMES.ownershipTransferInvitation, {
		to: target.email,
		from: MAIL_SENDERS.noReply,
		subject: 'Ownership transfer invitation',
		html,
	});
};

export const enqueueOwnershipTransferChangedBestEffort = async (
	user: User,
	role: 'owner' | 'admin',
	templateProvider: ITemplateProvider,
	emailQueueProvider: IEmailQueueProvider,
): Promise<void> => {
	try {
		const html = await templateProvider.ownershipTransferChanged({
			userName: user.name ?? 'Administrator',
			role,
		});
		await emailQueueProvider.add(EMAIL_JOB_NAMES.ownershipTransferChanged, {
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'Ownership transfer completed',
			html,
		});
	} catch (error) {
		logger.error({ err: error, userId: user.id, role }, 'Unable to enqueue ownership transfer notification');
	}
};
