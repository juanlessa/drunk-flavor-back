import { env } from '@/env';
import nodemailer, { Transporter } from 'nodemailer';

export const nodemailerTransporter = (): Transporter => {
	let transporter: Transporter | undefined = undefined;

	if (env.NODE_ENV === 'e2e') {
		nodemailer.createTestAccount((err, account) => {
			if (err) {
				throw new Error('Failed to create a test account: ' + err);
			}

			transporter = nodemailer.createTransport({
				host: account.smtp.host,
				port: account.smtp.port,
				secure: account.smtp.secure,
				auth: {
					user: account.user,
					pass: account.pass,
				},
			});
		});

		if (!transporter) {
			throw new Error('Transporter was not initialized in e2e environment.');
		}
	} else {
		transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: env.SMTP_PORT,
			auth: {
				user: env.SMTP_USERNAME,
				pass: env.SMTP_PASSWORD,
			},
		});
	}

	return transporter;
};
