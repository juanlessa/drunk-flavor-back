import { env } from '@/env';
import nodemailer, { Transporter } from 'nodemailer';

export const nodemailerTransporter = async (): Promise<Transporter> => {
	if (env.NODE_ENV === 'e2e') {
		const account = await nodemailer.createTestAccount();

		return nodemailer.createTransport({
			host: account.smtp.host,
			port: account.smtp.port,
			secure: account.smtp.secure,
			auth: {
				user: account.user,
				pass: account.pass,
			},
		});
	}

	return nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		auth: {
			user: env.SMTP_USERNAME,
			pass: env.SMTP_PASSWORD,
		},
	});
};
