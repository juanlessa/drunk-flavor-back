import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { BadRequestError } from '@/shared/error/error.lib';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { CLIENT_PAGE_PATHS } from '@/shared/constants/client.constants';
import { RequestPasswordReset } from './requestPasswordReset.dtos';
import { env } from '@/env';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';

export class RequestPasswordResetService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private dateProvider: IDateProvider,
		private cryptoProvider: ICryptoProvider,
		private emailQueueProvider: IEmailQueueProvider,
		private templateProvider: ITemplateProvider,
	) {}

	async execute({ email }: RequestPasswordReset) {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'RequestPasswordReset.service.1' });
		}

		const tokenAlreadyExists = await this.tokensRepository.findByUserIdAndType({
			userId: user.id,
			type: TokenTypes['forgot-password'],
		});

		if (tokenAlreadyExists && !this.dateProvider.isExpiredDate(tokenAlreadyExists.expiresAt)) {
			throw new BadRequestError('apiResponses.auth.actionAlreadyRequested', {
				path: 'RequestPasswordReset.service.2',
			});
		}

		if (tokenAlreadyExists && this.dateProvider.isExpiredDate(tokenAlreadyExists.expiresAt)) {
			await this.tokensRepository.delete(tokenAlreadyExists.id);
		}

		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);

		await this.tokensRepository.create({
			tokenHash: this.cryptoProvider.hashToken(token),
			type: TokenTypes['forgot-password'],
			userId: user.id,
			expiresAt: this.dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		const template = await this.templateProvider.forgotPassword({
			userName: user.name ?? '',
			resetLink: `${env.CLIENT_BASE_URL}${CLIENT_PAGE_PATHS.confirmPassword}/${token}`,
		});

		await this.emailQueueProvider.add(EMAIL_JOB_NAMES.forgotPassword, {
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'reset password',
			html: template,
		});
	}
}
