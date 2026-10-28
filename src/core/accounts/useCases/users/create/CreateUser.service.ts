import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { AdministrativeEventActions } from '@/core/accounts/entities/administrativeEvent.entity';
import { UserAdministrationPolicy } from '@/core/accounts/policies/UserAdministration.policy';
import { IAdministrativeEventsRepository } from '@/core/accounts/repositories/IAdministrativeEvents.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { env } from '@/env';
import { CLIENT_PAGE_PATHS } from '@/shared/constants/client.constants';
import { MAIL_SENDERS } from '@/shared/constants/mailer.constants';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IEmailQueueProvider } from '@/shared/providers/queue/email/IEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { CreateUserDTO } from './createUser.dtos';
import { authorizeUserAdministration, resolveAdministrativeEventContext } from '../userAdministrationAudit.helpers';
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
		private administrativeEventsRepository: IAdministrativeEventsRepository,
		private userAdministrationPolicy = new UserAdministrationPolicy(),
	) {}

	async execute({
		name,
		surname,
		email,
		password,
		role,
		actor,
		administrativeContext,
	}: CreateUserDTO): Promise<void> {
		const eventContext = resolveAdministrativeEventContext(administrativeContext);
		const initialActor = await findRequiredAdministrationUser(
			this.usersRepository,
			actor.id,
			'CreateUser.service.actor',
		);
		const initialCurrentActor = toAdministrationActor(initialActor);
		authorizeUserAdministration(
			{
				action: 'user.create',
				actorId: initialCurrentActor.id,
				requestedRole: role,
				context: eventContext,
			},
			() => this.userAdministrationPolicy.assertCanCreateUser(initialCurrentActor, role),
		);

		const passwordHash = await this.hashProvider.hash(password);
		const token = await this.cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);

		const user = await this.transactionManager.withTransaction(async () => {
			const persistedActor = await findRequiredAdministrationUser(
				this.usersRepository,
				actor.id,
				'CreateUser.service.actor',
			);
			const currentActor = toAdministrationActor(persistedActor);
			authorizeUserAdministration(
				{
					action: 'user.create',
					actorId: currentActor.id,
					requestedRole: role,
					context: eventContext,
				},
				() => this.userAdministrationPolicy.assertCanCreateUser(currentActor, role),
			);

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

				authorizeUserAdministration(
					{
						action: 'user.delete',
						actorId: currentActor.id,
						targetUserId: existingUser.id,
						context: eventContext,
					},
					() => this.userAdministrationPolicy.assertCanDeleteUser(currentActor, existingUser),
				);
				await this.usersRepository.delete(existingUser.id);
				await this.credentialsRepository.deleteByUserId(existingUser.id);
				await this.tokensRepository.deleteByUserId(existingUser.id);
				await this.administrativeEventsRepository.create({
					actorId: currentActor.id,
					targetUserId: existingUser.id,
					action: AdministrativeEventActions.userDeleted,
					before: { role: existingUser.role, status: existingUser.status },
					...eventContext,
				});
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

			await this.administrativeEventsRepository.create({
				actorId: currentActor.id,
				targetUserId: createdUser.id,
				action: AdministrativeEventActions.userCreated,
				after: { role: createdUser.role, status: createdUser.status },
				...eventContext,
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
