import { type IQueueProvider } from '@/shared/providers/queue/IQueue.provider';
import { type EmailJobDataMap } from './emailQueue.types';

export interface IEmailQueueProvider extends IQueueProvider<EmailJobDataMap> {}
