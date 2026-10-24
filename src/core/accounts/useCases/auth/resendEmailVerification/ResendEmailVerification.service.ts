import { UserStatuses } from '@/core/accounts/entities/user.entity';
import { TokenTypes } from '@/core/accounts/entities/token.entity';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { env } from '@/env';
import { ResendEmailVerification } from './resendEmailVerification.dtos';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { CLIENT_PAGE_PATHS } from '@/shared/constants/client.constants';

export class ResendEmailVerificationService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private dateProvider: IDateProvider,
		private cryptoProvider: ICryptoProvider,
		private templateProvider: ITemplateProvider,
		private emailQueueProvider: IEmailQueueProvider,
	) {}

	async execute({ email }: ResendEmailVerification): Promise<void> {
		const user = await this.usersRepository.findByEmail(email);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', {
				path: 'ResendEmailVerification.service.userNotFound',
			});
		}

		if (user.status === UserStatuses['active']) {
			throw new BadRequestError('apiResponses.auth.emailAlreadyVerified', {
				path: 'ResendEmailVerification.service.alreadyVerified',
			});
		}

		const existingToken = await this.tokensRepository.findByUserIdAndType({
			user_id: user._id.toString(),
			type: TokenTypes['email-verification'],
		});

		if (existingToken && !this.dateProvider.isExpiredDate(existingToken.expires_at)) {
			throw new BadRequestError('apiResponses.auth.actionAlreadyRequested', {
				path: 'ResendEmailVerification.service.resendNotAllowed',
			});
		}

		if (existingToken) {
			await this.tokensRepository.delete(existingToken._id.toString());
		}

		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);

		await this.tokensRepository.create({
			token: this.cryptoProvider.hashToken(token),
			type: TokenTypes['email-verification'],
			user_id: user._id.toString(),
			expires_at: this.dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		const html = await this.templateProvider.emailVerification({
			userName: user.name,
			verificationLink: `${env.CLIENT_BASE_URL}${CLIENT_PAGE_PATHS.verifyEmail}/${token}`,
		});

		await this.emailQueueProvider.add(EMAIL_JOB_NAMES.verification, {
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'verify email',
			html,
		});
	}
}
