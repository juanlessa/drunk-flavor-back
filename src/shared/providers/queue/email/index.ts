import { BullMQEmailQueueProvider } from '@/infrastructure/bullmq/queues/email/BullMQEmailQueue.provider';
import { type IEmailQueueProvider } from './IEmailQueue.provider';

const emailQueueProvider: IEmailQueueProvider = new BullMQEmailQueueProvider();

export const resolveEmailQueueProvider = () => emailQueueProvider;
