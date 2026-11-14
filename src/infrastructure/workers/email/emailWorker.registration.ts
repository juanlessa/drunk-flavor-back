import { parseWorkerEnv } from '@/env/worker';
import { createBullMQWorker } from '@/infrastructure/bullmq/workers/createBullMQWorker';
import { resolveMailerProvider } from '@/shared/providers/mailer';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import type { EmailJobDataMap } from '@/shared/providers/queue/email/emailQueue.types';
import { QUEUE_NAMES } from '@/shared/providers/queue/queue.constants';
import type { IWorkerRegistration } from '../IWorkerRegistration';
import { makeSendEmailHandler } from './sendEmail.handler';

export const emailWorkerRegistration: IWorkerRegistration = {
	name: 'email',
	connections: [],
	start: () => {
		const sendEmail = makeSendEmailHandler(resolveMailerProvider());
		return createBullMQWorker<EmailJobDataMap>({
			queueName: QUEUE_NAMES.email,
			handlers: {
				[EMAIL_JOB_NAMES.verification]: sendEmail,
				[EMAIL_JOB_NAMES.forgotPassword]: sendEmail,
				[EMAIL_JOB_NAMES.ownershipTransferInvitation]: sendEmail,
				[EMAIL_JOB_NAMES.ownershipTransferChanged]: sendEmail,
				[EMAIL_JOB_NAMES.userSessionsRevoked]: sendEmail,
			},
			concurrency: parseWorkerEnv().EMAIL_WORKER_CONCURRENCY,
		});
	},
};
