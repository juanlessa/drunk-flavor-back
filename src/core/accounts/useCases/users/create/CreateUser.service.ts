import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { CreateUserDTO } from './createUser.dtos';
import { defineAbilityFor } from '@/shared/accessControl';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { UserStatuses } from '@/core/accounts/entities/user.entity';
import { TokenTypes } from '@/core/accounts/entities/token.entity';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { CLIENT_PAGE_PATHS } from '@/shared/constants/client.constants';
import { env } from '@/env';

export class CreateUserService {
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

	async execute({ name, surname, email, password, role, actor }: CreateUserDTO): Promise<void> {
		const permissionUser = userPermissionSchema.parse({ id: actor.id, role: actor.role });
		const { cannot } = defineAbilityFor(permissionUser);
		if (cannot('create', 'User')) {
			throw new ForbiddenError('apiResponses.users.forbidden', {
				path: 'CreateUser.service.authorization',
			});
		}

		const existingUser = await this.usersRepository.findByEmail(email);
		if (existingUser && existingUser.status === UserStatuses['active']) {
			throw new BadRequestError('apiResponses.users.alreadyExist', {
				path: 'CreateUser.service.ensureEmailIsAvailable.active',
			});
		}
		if (existingUser && existingUser.status === UserStatuses['pending']) {
			const existingToken = await this.tokensRepository.findByUserIdAndType({
				user_id: existingUser._id.toString(),
				type: TokenTypes['email-verification'],
			});
			if (!existingToken || this.dateProvider.isExpiredDate(existingToken.expires_at)) {
				await this.usersRepository.delete(existingUser._id.toString());
			} else {
				throw new BadRequestError('apiResponses.auth.emailVerificationPending', {
					path: 'CreateUser.service.ensureEmailIsAvailable.pending',
				});
			}
		}

		const passwordHash = await this.hashProvider.hash(password);
		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);

		const user = await this.transactionManager.withTransaction(async () => {
			const createdUser = await this.usersRepository.create({
				name: name,
				surname: surname,
				email: email,
				email_verified: false,
				role: role,
				status: UserStatuses['pending'],
			});

			await this.credentialsRepository.create({
				user_id: createdUser._id.toString(),
				password_hash: passwordHash,
			});

			await this.tokensRepository.create({
				token: this.cryptoProvider.hashToken(token),
				type: TokenTypes['email-verification'],
				user_id: createdUser._id.toString(),
				expires_at: this.dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
			});

			return createdUser;
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
