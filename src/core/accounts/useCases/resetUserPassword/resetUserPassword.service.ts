import { IUsersRepository } from '../../repositories/IUsers.repository';
import { IUserTokensRepository } from '../../repositories/IUserTokens.repository';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { USER_MESSAGES } from '../../constants/users.constants';
import { ResetUserPassword } from './resetUserPassword.dtos';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { TokenTypeEnum } from '../../entities/userToken.entity';
import { FRONTEND_BASE_URL, FRONTEND_PAGE_PATHS } from '@/shared/constants/frontend.constants';

export class ResetUserPasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private cryptoProvider: ICryptoProvider,
		private mailerProvider: IMailerProvider,
		private templateProvider: ITemplateProvider,
	) {}

	async execute({ email }: ResetUserPassword) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError(USER_MESSAGES.notExist.message, { path: 'ResetUserPassword.service.1' });
		}

		const tokenAlreadyExists = await this.userTokensRepository.findByUserIdAndType({
			user_id: user._id.toString(),
			type: TokenTypeEnum['reset-password'],
		});
		if (!tokenAlreadyExists) {
			throw new BadRequestError('token already exists', { path: 'ResetUserPassword.service.2' });
		}

		const token = await this.cryptoProvider.generateToken(16);

		const template = this.templateProvider.passwordReset({
			userName: user.name,
			resetLink: `${FRONTEND_BASE_URL}${FRONTEND_PAGE_PATHS}/${token}`,
		});

		await this.mailerProvider.send({
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'reset password',
			html: template,
		});

		await this.userTokensRepository.create({
			token,
			type: TokenTypeEnum['reset-password'],
			user_id: user._id.toString(),
		});
	}
}
