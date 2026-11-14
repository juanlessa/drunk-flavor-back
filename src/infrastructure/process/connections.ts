import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';

export interface ManagedConnection {
	name: string;
	start: () => Promise<void>;
	stop: () => Promise<void>;
}

export const mongoConnection: ManagedConnection = {
	name: 'Mongo',
	start: () => MongoConnection.Instance.start(),
	stop: () => MongoConnection.Instance.stop(),
};

export const redisConnection: ManagedConnection = {
	name: 'Redis',
	start: () => RedisConnection.Instance.start(),
	stop: () => RedisConnection.Instance.stop(),
};

export const bullmqConnection: ManagedConnection = {
	name: 'BullMQ',
	start: () => BullMQConnection.Instance.start(),
	stop: () => BullMQConnection.Instance.stop(),
};
