import { type Mock, vi } from 'vitest';
import { type IEmailQueueProvider } from '../IEmailQueue.provider';
import { type ObliterateQueueOptions, type QueueJobState } from '../../IQueue.provider';
import { type EmailJobDataMap } from '../emailQueue.types';

type AddArgs = {
	[Name in keyof EmailJobDataMap & string]: [name: Name, data: EmailJobDataMap[Name]];
}[keyof EmailJobDataMap & string];

export class MockEmailQueueProvider implements IEmailQueueProvider {
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

	add<Name extends keyof EmailJobDataMap & string>(name: Name, data: EmailJobDataMap[Name]): Promise<void> {
		return this.addMock(...([name, data] as AddArgs));
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
