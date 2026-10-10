import { type Job } from 'bullmq';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import type { EmailJobData, EmailJobName } from '@/shared/providers/queue/email/emailQueue.types';

export const makeSendEmailProcessor =
	(mailer: IMailerProvider) =>
	async (job: Job<EmailJobData, void, EmailJobName>): Promise<void> => {
		// Throwing from the processor triggers BullMQ's attempts/backoff policy.
		await mailer.send(job.data);
	};
