import { parseWorkerEnv } from '@/env/worker';
import { createBullMQWorker } from '@/infrastructure/bullmq/workers/createBullMQWorker';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import type { EmailJobData, EmailJobName } from '@/shared/providers/queue/email/emailQueue.types';
import { QUEUE_NAMES } from '@/shared/providers/queue/queue.constants';
import type { IWorkerRegistration } from '../IWorkerRegistration';
import { makeSendEmailHandler } from './sendEmail.handler';

export const emailWorkerRegistration: IWorkerRegistration = {
	name: 'email',
	connections: [],
	// Settings and collaborators are resolved lazily, only when the worker starts.
	start: () =>
		createBullMQWorker<EmailJobData, EmailJobName>({
			queueName: QUEUE_NAMES.email,
			handler: makeSendEmailHandler(resolveMailerProvider()),
			concurrency: parseWorkerEnv().EMAIL_WORKER_CONCURRENCY,
		}),
};
