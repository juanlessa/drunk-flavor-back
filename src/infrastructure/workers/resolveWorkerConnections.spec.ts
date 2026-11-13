import { describe, expect, it, vi } from 'vitest';
import { bullmqConnection, mongoConnection, redisConnection } from '@/infrastructure/process/connections';
import type { IWorkerRegistration } from './IWorkerRegistration';
import { resolveWorkerConnections } from './resolveWorkerConnections';

vi.mock('@/infrastructure/process/connections', () => ({
	bullmqConnection: { name: 'BullMQ', start: vi.fn(), stop: vi.fn() },
	mongoConnection: { name: 'Mongo', start: vi.fn(), stop: vi.fn() },
	redisConnection: { name: 'Redis', start: vi.fn(), stop: vi.fn() },
}));

const makeRegistration = (name: string, connections: IWorkerRegistration['connections']): IWorkerRegistration => ({
	name,
	connections,
	start: vi.fn(),
});

describe('resolveWorkerConnections', () => {
	it('should always include the engine connection, even when no worker declares connections', () => {
		expect(resolveWorkerConnections([makeRegistration('email', [])], bullmqConnection)).toEqual([bullmqConnection]);
	});

	it('should include the connections declared by the workers', () => {
		const result = resolveWorkerConnections(
			[makeRegistration('email', []), makeRegistration('cleanup', [mongoConnection, redisConnection])],
			bullmqConnection,
		);
		expect(result).toEqual([bullmqConnection, mongoConnection, redisConnection]);
	});

	it('should open a connection shared by several workers only once', () => {
		const result = resolveWorkerConnections(
			[makeRegistration('cleanup', [mongoConnection]), makeRegistration('report', [mongoConnection])],
			bullmqConnection,
		);
		expect(result.filter((connection) => connection.name === 'Mongo')).toHaveLength(1);
	});

	it('should not duplicate BullMQ when a worker declares it explicitly', () => {
		const result = resolveWorkerConnections([makeRegistration('email', [bullmqConnection])], bullmqConnection);
		expect(result).toEqual([bullmqConnection]);
	});
});
