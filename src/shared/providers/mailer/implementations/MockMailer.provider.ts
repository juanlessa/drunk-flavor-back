import { vi } from 'vitest';
import { IMailerProvider } from '../IMailer.provider';
import { SendMail } from '../mailer.dtos';

export class MockMailerProvider implements IMailerProvider {
	send = vi.fn().mockImplementation((_data: SendMail) => {});
}
