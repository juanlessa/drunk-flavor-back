import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { UserTokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/UserTokens.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ResendEmailVerificationService } from './ResendEmailVerification.service';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { TokenTypes, UserToken } from '@/core/accounts/entities/userToken.entity';
import { UserStatuses } from '@/core/accounts/entities/user.entity';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError } from '@/shared/error/error.lib';
import { env } from '@/env';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';

let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let dateProvider: IDateProvider;
let cryptoProvider: ICryptoProvider;
let hashProvider: BcryptHashProvider;
let templateProvider: ITemplateProvider;
let emailQueueProvider: MockEmailQueueProvider;
let service: ResendEmailVerificationService;

const { name, surname, email, password } = createUserFactory();

const createPendingUser = async () => {
	return usersRepository.create({
		name,
		surname,
		email,
		role: Roles['member'],
		status: UserStatuses['pending'],
		password: await hashProvider.hash(password),
	});
};

describe('ResendEmailVerification', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		usersRepository = new UsersRepositoryInMemory();
		userTokensRepository = new UserTokensRepositoryInMemory();
		dateProvider = new DayjsProvider();
		cryptoProvider = new NodeCryptoProvider();
		hashProvider = new BcryptHashProvider();
		templateProvider = new MjmlProvider();
		emailQueueProvider = new MockEmailQueueProvider();
		service = new ResendEmailVerificationService(
			usersRepository,
			userTokensRepository,
			dateProvider,
			cryptoProvider,
			templateProvider,
			emailQueueProvider,
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('Should be able to resend the email verification for a pending user without a token', async () => {
		const createdUser = await createPendingUser();

		await service.execute({ email });

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
	});

	it('Should queue the verification email when resend succeeds', async () => {
		await createPendingUser();

		await service.execute({ email });

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});

	it('Should not be able to resend the email verification for a nonexistent user', async () => {
		await expect(service.execute({ email: 'invalid-email@test.com' })).rejects.toBeInstanceOf(BadRequestError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('Should not be able to resend the email verification for an already active user', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role: Roles['member'],
			status: UserStatuses['active'],
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(BadRequestError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('Should not be able to resend the email verification when a valid token already exists', async () => {
		const createdUser = await createPendingUser();
		const token = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await userTokensRepository.create({
			token: cryptoProvider.hashToken(token),
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.USER_TOKEN_EXPIRES_IN_SECONDS),
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(BadRequestError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('Should be able to resend the email verification after the previous token has expired', async () => {
		const createdUser = await createPendingUser();
		const initialToken = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await userTokensRepository.create({
			token: cryptoProvider.hashToken(initialToken),
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.USER_TOKEN_EXPIRES_IN_SECONDS),
		});

		vi.advanceTimersByTime(env.USER_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await service.execute({ email });

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
		expect(verifyUserToken.token).not.toBe(cryptoProvider.hashToken(initialToken));
		expect(await userTokensRepository.findByToken(cryptoProvider.hashToken(initialToken))).toBeNull();

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});
});
