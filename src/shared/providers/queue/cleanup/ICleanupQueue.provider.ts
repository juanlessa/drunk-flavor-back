import { type IQueueProvider } from '@/shared/providers/queue/IQueue.provider';
import { type CleanupJobDataMap } from './cleanupQueue.types';

export interface ICleanupQueueProvider extends IQueueProvider<CleanupJobDataMap> {}
