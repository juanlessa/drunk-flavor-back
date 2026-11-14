import { describe, expect, it } from 'vitest';
import { parseWorkerEnv } from './worker';

describe('parseWorkerEnv', () => {
	it('should default the worker concurrencies', () => {
		expect(parseWorkerEnv({})).toEqual({ EMAIL_WORKER_CONCURRENCY: 5, CLEANUP_WORKER_CONCURRENCY: 2 });
	});

	it('should coerce the concurrencies from strings', () => {
		expect(parseWorkerEnv({ EMAIL_WORKER_CONCURRENCY: '8', CLEANUP_WORKER_CONCURRENCY: '3' })).toEqual({
			EMAIL_WORKER_CONCURRENCY: 8,
			CLEANUP_WORKER_CONCURRENCY: 3,
		});
	});

	it('should reject a cleanup concurrency lower than 1', () => {
		expect(() => parseWorkerEnv({ CLEANUP_WORKER_CONCURRENCY: '0' })).toThrow();
	});

	it('should reject a concurrency lower than 1', () => {
		expect(() => parseWorkerEnv({ EMAIL_WORKER_CONCURRENCY: '0' })).toThrow();
	});
});
