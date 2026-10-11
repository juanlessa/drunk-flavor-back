import { type Worker } from 'bullmq';
import { parseBullmqEnv } from '@/env/bullmq';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import type { EmailJobData, EmailJobName } from '@/shared/providers/queue/email/emailQueue.types';
import { createEmailWorker } from './EmailWorker';
import { makeSendEmailProcessor } from './sendEmail.processor';

const bullmq = parseBullmqEnv();

export const resolveEmailWorker = (): Worker<EmailJobData, void, EmailJobName> => {
	const processor = makeSendEmailProcessor(resolveMailerProvider());
	return createEmailWorker(processor, bullmq.EMAIL_WORKER_CONCURRENCY);
};
