import nodemailer, { Transporter } from 'nodemailer';
import { IMailerProvider } from '../IMailer.provider';
import { SendMail } from '../mailer.dtos';
import { env } from '@/env';

export class NodemailerProvider implements IMailerProvider {
	private transporter: Transporter;
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: env.SMTP_PORT,
			auth: {
				user: env.SMTP_USERNAME,
				pass: env.SMTP_PASSWORD,
			},
		});
	}

	async send({ from, to, subject, html }: SendMail) {
		await this.transporter.sendMail({ from, to, subject, html });
	}
}
