import { type Worker } from 'bullmq';
import { env } from '@/env';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import type { EmailJobData, EmailJobName } from '@/shared/providers/queue/email/emailQueue.types';
import { createEmailWorker } from './EmailWorker';
import { makeSendEmailProcessor } from './sendEmail.processor';

export const resolveEmailWorker = (): Worker<EmailJobData, void, EmailJobName> => {
	const processor = makeSendEmailProcessor(resolveMailerProvider());
	return createEmailWorker(processor, env.EMAIL_WORKER_CONCURRENCY);
};
