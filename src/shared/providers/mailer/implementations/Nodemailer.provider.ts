import nodemailer, { Transporter } from 'nodemailer';
import { IMailerProvider } from '../IMailer.provider';
import { SendMail } from '../mailer.dtos';

export class NodemailerProvider implements IMailerProvider {
	constructor(private transporter: Transporter) {}

	async send({ from, to, subject, html }: SendMail) {
		await this.transporter.sendMail({ from, to, subject, html });
	}
}
