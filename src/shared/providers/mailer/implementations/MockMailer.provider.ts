import { type Mock, vi } from 'vitest';
import { IMailerProvider } from '../IMailer.provider';
import { SendMail } from '../mailer.dtos';

export class MockMailerProvider implements IMailerProvider {
	send: Mock<(data: SendMail) => Promise<void>> = vi.fn().mockImplementation((_data: SendMail) => Promise.resolve());
}
