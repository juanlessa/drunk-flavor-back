import { QUEUE_NAMES } from './queue.constants';

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
