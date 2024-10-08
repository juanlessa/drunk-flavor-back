import { IUsersRepository } from '../../repositories/IUsers.repository';
import { IUsersTokensRepository } from '../../repositories/IUsersTokens.repository';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '../../constants/users.constants';
import { ResetUserPassword } from './resetUserPassword.dtos';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';

export class ResetUserPasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private usersTokensRepository: IUsersTokensRepository,
		private mailerProvider: IMailerProvider,
		private templateProvider: ITemplateProvider,
	) {}

	async execute({ email }: ResetUserPassword) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError(USER_MESSAGES.notExist.message, { path: 'ResetUserPassword.service' });
		}

		const template = this.templateProvider.passwordReset({
			userName: user.name,
			resetLink: 'http://reset-password/confirm',
		});

		await this.mailerProvider.send({
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'reset password',
			html: template,
		});
	}
}
