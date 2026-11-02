import { afterAll, beforeAll, inject } from 'vitest';
import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { parseControlEnv } from '@/env/control';
import { configureMailerProvider } from '@/shared/providers/mailer';

const control = parseControlEnv();

beforeAll(async () => {
	const mongoConnectionString = inject('mongoConnectionString');
	const redisCacheConnectionString = inject('redisCacheConnectionString');
	const bullmqConnectionString = inject('bullmqConnectionString');
	const smtpConnection = inject('smtpConnection');

	await MongoConnection.Instance.start(mongoConnectionString);
	await RedisConnection.Instance.start(redisCacheConnectionString);
	await BullMQConnection.Instance.start(bullmqConnectionString);

	// Managed mode only: point the mailer at the MailDev server started in
	// globalSetup. In external mode the mailer reads the SMTP_* variables itself.
	if (smtpConnection) {
		configureMailerProvider(smtpConnection);
	}
});

afterAll(async () => {
	if (control.MONGO_MODE === 'external') {
		await MongoConnection.Instance.dropAllCollections();
	}

	await BullMQConnection.Instance.stop();
	await RedisConnection.Instance.stop();
	await MongoConnection.Instance.stop();
});
