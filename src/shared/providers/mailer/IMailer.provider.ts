import { SendMail } from './mailer.dtos';

export interface IMailerProvider {
	send(data: SendMail): Promise<void>;
}
