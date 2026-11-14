import type { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import type { EmailJobData } from '@/shared/providers/queue/email/emailQueue.types';

export const makeSendEmailHandler =
	(mailer: IMailerProvider) =>
	async (data: EmailJobData): Promise<void> => {
		await mailer.send(data);
	};
