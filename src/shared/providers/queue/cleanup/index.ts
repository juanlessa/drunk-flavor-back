import { BullMQCleanupQueueProvider } from '@/infrastructure/bullmq/queues/cleanup/BullMQCleanupQueue.provider';
import { type ICleanupQueueProvider } from './ICleanupQueue.provider';

const cleanupQueueProvider: ICleanupQueueProvider = new BullMQCleanupQueueProvider();

export const resolveCleanupQueueProvider = () => cleanupQueueProvider;
