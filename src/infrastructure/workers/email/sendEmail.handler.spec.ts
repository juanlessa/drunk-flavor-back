import { describe, expect, it, vi } from 'vitest';
import type { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import type { EmailJobData } from '@/shared/providers/queue/email/emailQueue.types';
import { makeSendEmailHandler } from './sendEmail.handler';

const makeMailer = (send: IMailerProvider['send']): IMailerProvider => ({ send }) as IMailerProvider;

describe('makeSendEmailHandler', () => {
	const data = { to: 'user@example.com' } as unknown as EmailJobData;

	it('should send the job payload through the mailer', async () => {
		const send = vi.fn(async () => {});
		await makeSendEmailHandler(makeMailer(send))(data);
		expect(send).toHaveBeenCalledWith(data);
	});

	it('should propagate mailer failures so the engine can retry', async () => {
		const send = vi.fn(async () => {
			throw new Error('smtp down');
		});
		await expect(makeSendEmailHandler(makeMailer(send))(data)).rejects.toThrow('smtp down');
	});
});
