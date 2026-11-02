import { User } from '@/core/accounts/entities/user.entity';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { logger } from '@/shared/providers/logger';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';

export const enqueueUserSessionsRevokedBestEffort = async (
	user: User,
	templateProvider: ITemplateProvider,
	emailQueueProvider: IEmailQueueProvider,
): Promise<void> => {
	try {
		const html = await templateProvider.userSessionsRevoked({ userName: user.name ?? 'there' });
		await emailQueueProvider.add(EMAIL_JOB_NAMES.userSessionsRevoked, {
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'Your Drunk Flavor sessions were ended',
			html,
		});
	} catch (error) {
		logger.error({ err: error, userId: user.id }, 'Unable to enqueue user sessions revoked notification');
	}
};
