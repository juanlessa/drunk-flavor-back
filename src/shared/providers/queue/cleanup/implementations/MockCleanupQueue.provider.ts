import { type Mock, vi } from 'vitest';
import { type ICleanupQueueProvider } from '../ICleanupQueue.provider';
import { type AddJobOptions, type ObliterateQueueOptions, type QueueJobState } from '../../IQueue.provider';
import { type CleanupJobDataMap } from '../cleanupQueue.types';

type AddArgs = {
	[Name in keyof CleanupJobDataMap & string]: [name: Name, data: CleanupJobDataMap[Name], options?: AddJobOptions];
}[keyof CleanupJobDataMap & string];

export class MockCleanupQueueProvider implements ICleanupQueueProvider {
	readonly addMock: Mock<(...args: AddArgs) => Promise<void>> = vi.fn().mockImplementation(() => Promise.resolve());
	readonly drainMock: Mock<(delayed?: boolean) => Promise<void>> = vi
		.fn()
		.mockImplementation(() => Promise.resolve());
	readonly cleanMock: Mock<(graceMs: number, limit: number, state: QueueJobState) => Promise<string[]>> = vi
		.fn()
		.mockImplementation(() => Promise.resolve([]));
	readonly obliterateMock: Mock<(options?: ObliterateQueueOptions) => Promise<void>> = vi
		.fn()
		.mockImplementation(() => Promise.resolve());
	readonly closeMock: Mock<() => Promise<void>> = vi.fn().mockImplementation(() => Promise.resolve());

	add<Name extends keyof CleanupJobDataMap & string>(
		name: Name,
		data: CleanupJobDataMap[Name],
		options?: AddJobOptions,
	): Promise<void> {
		// Forward the options only when given, so assertions on (name, data) stay exact.
		return this.addMock(...((options ? [name, data, options] : [name, data]) as AddArgs));
	}

	drain(delayed?: boolean): Promise<void> {
		return this.drainMock(delayed);
	}

	clean(graceMs: number, limit: number, state: QueueJobState): Promise<string[]> {
		return this.cleanMock(graceMs, limit, state);
	}

	obliterate(options?: ObliterateQueueOptions): Promise<void> {
		return this.obliterateMock(options);
	}

	close(): Promise<void> {
		return this.closeMock();
	}
}
