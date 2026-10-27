import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { CreateUserDTO } from './createUser.dtos';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
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
import { findRequiredAdministrationUser, toAdministrationActor } from '../userAdministration.helpers';

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
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({ name, surname, email, password, role, actor }: CreateUserDTO): Promise<void> {
		const initialActor = await findRequiredAdministrationUser(
			this.usersRepository,
			actor.id,
			'CreateUser.service.actor',
		);
		this.userAdministrationPolicy.assertCanCreateUser(toAdministrationActor(initialActor), role);

		const passwordHash = await this.hashProvider.hash(password);
		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);

		const user = await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'CreateUser.service.actor',
			);
			const currentActor = toAdministrationActor(persistedActor);
			this.userAdministrationPolicy.assertCanCreateUser(currentActor, role);

			const existingUser = await this.usersRepository.findByEmail(email);
			if (existingUser && existingUser.status === UserStatuses.active) {
				throw new BadRequestError('apiResponses.users.alreadyExist', {
					path: 'CreateUser.service.ensureEmailIsAvailable.active',
				});
			}
			if (existingUser && existingUser.status === UserStatuses.pending) {
				const existingToken = await this.tokensRepository.findByUserIdAndType({
					userId: existingUser.id,
					type: TokenTypes['email-verification'],
				});
				if (existingToken && !this.dateProvider.isExpiredDate(existingToken.expiresAt)) {
					throw new BadRequestError('apiResponses.auth.emailVerificationPending', {
						path: 'CreateUser.service.ensureEmailIsAvailable.pending',
					});
				}

				this.userAdministrationPolicy.assertCanDeleteUser(currentActor, existingUser);
				await this.usersRepository.delete(existingUser.id);
				await this.credentialsRepository.deleteByUserId(existingUser.id);
				await this.tokensRepository.deleteByUserId(existingUser.id);
			}

			const createdUser = await this.usersRepository.create({
				name,
				surname,
				email,
				emailVerified: false,
				role,
				status: UserStatuses.pending,
			});

			await this.credentialsRepository.create({
				userId: createdUser.id,
				passwordHash,
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
