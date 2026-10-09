import { type Mock, vi } from 'vitest';
import { type IEmailQueueProvider } from '../IEmailQueue.provider';
import { type EmailJobDataMap } from '../emailQueue.types';

type AddArgs = {
	[Name in keyof EmailJobDataMap & string]: [name: Name, data: EmailJobDataMap[Name]];
}[keyof EmailJobDataMap & string];

export class MockEmailQueueProvider implements IEmailQueueProvider {
	readonly addMock: Mock<(...args: AddArgs) => Promise<void>> = vi.fn().mockImplementation(() => Promise.resolve());
	readonly closeMock: Mock<() => Promise<void>> = vi.fn().mockImplementation(() => Promise.resolve());

	add<Name extends keyof EmailJobDataMap & string>(name: Name, data: EmailJobDataMap[Name]): Promise<void> {
		return this.addMock(...([name, data] as AddArgs));
	}

	close(): Promise<void> {
		return this.closeMock();
	}
}
