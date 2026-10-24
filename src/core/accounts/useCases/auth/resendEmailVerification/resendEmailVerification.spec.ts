import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ResendEmailVerificationService } from './ResendEmailVerification.service';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { TokenTypes, Token } from '@/core/accounts/entities/token.entity';
import { UserStatuses } from '@/core/accounts/entities/user.entity';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError } from '@/shared/error/error.lib';
import { env } from '@/env';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';

let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let dateProvider: IDateProvider;
let cryptoProvider: ICryptoProvider;
let templateProvider: ITemplateProvider;
let emailQueueProvider: MockEmailQueueProvider;
let service: ResendEmailVerificationService;

const { name, surname, email } = createUserFactory();

const createPendingUser = async () => {
	return usersRepository.create({
		name,
		surname,
		email,
		role: Roles['member'],
		status: UserStatuses['pending'],
	});
};

describe('ResendEmailVerification', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		dateProvider = new DayjsProvider();
		cryptoProvider = new NodeCryptoProvider();
		templateProvider = new MjmlProvider();
		emailQueueProvider = new MockEmailQueueProvider();
		service = new ResendEmailVerificationService(
			usersRepository,
			tokensRepository,
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

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.token).toBeTruthy();
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
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(BadRequestError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('Should not be able to resend the email verification when a valid token already exists', async () => {
		const createdUser = await createPendingUser();
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token: cryptoProvider.hashToken(token),
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(BadRequestError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('Should be able to resend the email verification after the previous token has expired', async () => {
		const createdUser = await createPendingUser();
		const initialToken = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token: cryptoProvider.hashToken(initialToken),
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		vi.advanceTimersByTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await service.execute({ email });

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.token).toBeTruthy();
		expect(verifyToken.token).not.toBe(cryptoProvider.hashToken(initialToken));
		expect(await tokensRepository.findByToken(cryptoProvider.hashToken(initialToken))).toBeNull();

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});
});
