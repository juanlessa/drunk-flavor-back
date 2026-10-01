import { env } from '@/env';
import nodemailer, { Transporter } from 'nodemailer';

export const nodemailerTransporter = (): Transporter => {
	const auth =
		env.SMTP_USERNAME && env.SMTP_PASSWORD
			? {
					user: env.SMTP_USERNAME,
					pass: env.SMTP_PASSWORD,
				}
			: undefined;

	return nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		auth,
	});
};
