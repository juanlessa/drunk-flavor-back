import { describe, expect, it } from 'vitest';
import { parseWorkerEnv } from './worker';

describe('parseWorkerEnv', () => {
	it('should default the email worker concurrency to 5', () => {
		expect(parseWorkerEnv({})).toEqual({ EMAIL_WORKER_CONCURRENCY: 5 });
	});

	it('should coerce the email worker concurrency from a string', () => {
		expect(parseWorkerEnv({ EMAIL_WORKER_CONCURRENCY: '8' })).toEqual({ EMAIL_WORKER_CONCURRENCY: 8 });
	});

	it('should reject a concurrency lower than 1', () => {
		expect(() => parseWorkerEnv({ EMAIL_WORKER_CONCURRENCY: '0' })).toThrow();
	});
});
