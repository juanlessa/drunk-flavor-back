import { IUsersRepository } from '../../repositories/IUsers.repository';
import { IUserTokensRepository } from '../../repositories/IUserTokens.repository';
import { TokenTypeEnum } from '../../entities/userToken.entity';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { FRONTEND_BASE_URL, FRONTEND_PAGE_PATHS } from '@/shared/constants/frontend.constants';
import { ForgotPassword } from './forgotPassword.dtos';
import { env } from '@/env';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';

export class ForgotPasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private dateProvider: IDateProvider,
		private cryptoProvider: ICryptoProvider,
		private mailerProvider: IMailerProvider,
		private templateProvider: ITemplateProvider,
	) {}

	private isTokenExpired(createdAt: Date): boolean {
		const expirationDate = this.dateProvider.addSeconds(env.USER_TOKEN_EXPIRES_IN_SECONDS, createdAt);
		return this.dateProvider.isExpiredDate(expirationDate);
	}

	async execute({ email }: ForgotPassword) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'ForgotPassword.service.1' });
		}

		const tokenAlreadyExists = await this.userTokensRepository.findByUserIdAndType({
			user_id: user._id.toString(),
			type: TokenTypeEnum['forgot-password'],
		});

		if (tokenAlreadyExists && !this.isTokenExpired(tokenAlreadyExists.created_at)) {
			throw new BadRequestError('apiResponses.auth.actionAlreadyRequested', {
				path: 'ForgotPassword.service.2',
			});
		}

		if (tokenAlreadyExists && this.isTokenExpired(tokenAlreadyExists.created_at)) {
			await this.userTokensRepository.delete(tokenAlreadyExists._id.toString());
		}

		const token = await this.cryptoProvider.generateToken(env.USER_TOKEN_SIZE);

		const template = this.templateProvider.forgotPassword({
			userName: user.name,
			resetLink: `${FRONTEND_BASE_URL}${FRONTEND_PAGE_PATHS.resetPassword}/${token}`,
		});

		await this.mailerProvider.send({
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'reset password',
			html: template,
		});

		await this.userTokensRepository.create({
			token,
			type: TokenTypeEnum['forgot-password'],
			user_id: user._id.toString(),
		});
	}
}
