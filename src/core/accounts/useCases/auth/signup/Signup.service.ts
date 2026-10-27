import { User } from '@/core/accounts/entities/user.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { Signup } from './signup.dtos';
import { env } from '@/env';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { Roles } from '@/shared/accessControl/roles';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { CLIENT_PAGE_PATHS } from '@/shared/constants/client.constants';

export class SignupService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private transactionManager: ITransactionManager,
		private dateProvider: IDateProvider,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
		private templateProvider: ITemplateProvider,
		private emailQueueProvider: IEmailQueueProvider,
	) {}

	async execute({ name, surname, email, password }: Signup): Promise<void> {
		const existingUser = await this.usersRepository.findByEmail(email);
		if (existingUser && existingUser.status === UserStatuses['active']) {
			throw new BadRequestError('apiResponses.users.alreadyExist', {
				path: 'Signup.service.ensureEmailIsAvailable.active',
			});
		}
		if (existingUser && existingUser.status === UserStatuses['pending']) {
			throw new BadRequestError('apiResponses.auth.emailVerificationPending', {
				path: 'Signup.service.ensureEmailIsAvailable.pending',
			});
		}

		const passwordHash = await this.hashProvider.hash(password);
		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);

		const user = await this.transactionManager.withTransaction(async () => {
			const createdUser = await this.usersRepository.create({
				name: name,
				surname: surname,
				email: email,
				emailVerified: false,
				role: Roles['member'],
				status: UserStatuses['pending'],
			});

			await this.credentialsRepository.create({
				userId: createdUser.id,
				passwordHash: passwordHash,
			});

			await this.tokensRepository.create({
				tokenHash: this.cryptoProvider.hashToken(token),
				type: TokenTypes['email-verification'],
				userId: createdUser.id,
				expiresAt: this.dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
			});

			return createdUser;
		});

		const html = await this.templateProvider.emailVerification({
			userName: name,
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
