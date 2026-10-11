import { parseSmtpEnv } from '@/env/smtp';
import nodemailer, { Transporter } from 'nodemailer';

const smtp = parseSmtpEnv();

export const nodemailerTransporter = (): Transporter => {
	const auth =
		smtp.SMTP_USERNAME && smtp.SMTP_PASSWORD
			? {
					user: smtp.SMTP_USERNAME,
					pass: smtp.SMTP_PASSWORD,
				}
			: undefined;

	return nodemailer.createTransport({
		host: smtp.SMTP_HOST,
		port: smtp.SMTP_PORT,
		auth,
	});
};
