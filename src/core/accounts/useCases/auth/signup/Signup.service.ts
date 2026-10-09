import { User, UserStatusEnum } from '@/core/accounts/entities/user.entity';
import { TokenTypeEnum } from '@/core/accounts/entities/userToken.entity';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { Signup } from './signup.dtos';
import { env } from '@/env';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { RolesEnum } from '@/shared/accessControl/roles';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { FRONTEND_BASE_URL, FRONTEND_PAGE_PATHS } from '@/shared/constants/frontend.constants';

export class SignupService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
		private transactionManager: ITransactionManager,
		private hashProvider: IHashProvider,
		private cryptoProvider: ICryptoProvider,
		private templateProvider: ITemplateProvider,
		private emailQueueProvider: IEmailQueueProvider,
	) {}

	async execute({ name, surname, email, password }: Signup): Promise<void> {
		const existingUser = await this.usersRepository.findByEmail(email);
		if (existingUser && existingUser.status === UserStatusEnum['active']) {
			throw new BadRequestError('apiResponses.users.alreadyExist', {
				path: 'Signup.service.ensureEmailIsAvailable.active',
			});
		}
		if (existingUser && existingUser.status === UserStatusEnum['pending']) {
			throw new BadRequestError('apiResponses.auth.emailVerificationPending', {
				path: 'Signup.service.ensureEmailIsAvailable.pending',
			});
		}

		const passwordHash = await this.hashProvider.hash(password);
		const token = await this.cryptoProvider.generateToken(env.USER_TOKEN_SIZE);

		const user = await this.transactionManager.withTransaction(async () => {
			const createdUser = await this.usersRepository.create({
				name: name,
				surname: surname,
				email: email,
				password: passwordHash,
				role: RolesEnum['member'],
				status: UserStatusEnum['pending'],
			});

			await this.userTokensRepository.create({
				token,
				type: TokenTypeEnum['email-verification'],
				user_id: createdUser._id.toString(),
			});

			return createdUser;
		});

		const html = await this.templateProvider.emailVerification({
			userName: user.name,
			verificationLink: `${FRONTEND_BASE_URL}${FRONTEND_PAGE_PATHS.verifyEmail}/${token}`,
		});

		await this.emailQueueProvider.add(EMAIL_JOB_NAMES.verification, {
			to: user.email,
			from: MAIL_SENDERS.noReply,
			subject: 'verify email',
			html,
		});
	}
}
