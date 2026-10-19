import { MongoConnection } from '@/infrastructure/mongo/MongoConnection';
import { RedisConnection } from '@/infrastructure/redis/RedisConnection';
import { BullMQConnection } from '@/infrastructure/bullmq/BullMQConnection';
import { type ReadinessReport } from './health.schema';

const HEALTH_CHECK_TIMEOUT_MS = 2000;

// Races a health check against a timer so a hung dependency resolves to `false`
// (reported as `down`) instead of stalling the readiness probe.
const withTimeout = (check: Promise<boolean>): Promise<boolean> => {
	const timeout = new Promise<boolean>((resolve) => {
		setTimeout(() => resolve(false), HEALTH_CHECK_TIMEOUT_MS).unref();
	});
	return Promise.race([check, timeout]);
};

// Wrapping the `.Instance.isHealthy()` call in an async arrow turns a synchronous
// throw from a connection getter into a rejected promise captured by allSettled.
const safeCheck = (check: () => Promise<boolean>): Promise<boolean> => withTimeout((async () => check())());

const toStatus = (result: PromiseSettledResult<boolean>): 'up' | 'down' =>
	result.status === 'fulfilled' && result.value === true ? 'up' : 'down';

export async function checkReadiness(): Promise<{ report: ReadinessReport; ok: boolean }> {
	const [mongo, redis, bullmq] = await Promise.allSettled([
		safeCheck(() => MongoConnection.Instance.isHealthy()),
		safeCheck(() => RedisConnection.Instance.isHealthy()),
		safeCheck(() => BullMQConnection.Instance.isHealthy()),
	]);

	const dependencies = {
		mongo: toStatus(mongo),
		redis: toStatus(redis),
		bullmq: toStatus(bullmq),
	};

	const ok = dependencies.mongo === 'up' && dependencies.redis === 'up' && dependencies.bullmq === 'up';

	const report: ReadinessReport = {
		status: ok ? 'ok' : 'error',
		dependencies,
	};

	return { report, ok };
}
