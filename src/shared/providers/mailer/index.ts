import type { SmtpConnection } from '@/env/smtp';
import { IMailerProvider } from './IMailer.provider';
import { NodemailerProvider } from './implementations/Nodemailer.provider';
import { nodemailerTransporter } from './implementations/nodemailerTransporter.helper';

let mailerProvider: IMailerProvider | undefined;

/**
 * Builds the mailer provider on first use, so the SMTP environment is not read
 * when this module is imported.
 */
export const resolveMailerProvider = (): IMailerProvider => {
	mailerProvider ??= new NodemailerProvider(nodemailerTransporter());
	return mailerProvider;
};

/**
 * Replaces the mailer provider with one bound to an explicit SMTP connection.
 * Used by the test setup to point the mailer at a managed MailDev server whose
 * port is only known at runtime.
 */
export const configureMailerProvider = (connection: SmtpConnection): void => {
	mailerProvider = new NodemailerProvider(nodemailerTransporter(connection));
};
