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
import { Token } from '@/core/accounts/entities/token.entity';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { Roles } from '@/shared/accessControl/roles';
import { NotFoundError, ConflictError } from '@/shared/error/error.lib';
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

describe('Resend Email Verification', () => {
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

	it('stores a verification token for a pending user without one', async () => {
		const createdUser = await createPendingUser();

		await service.execute({ email });

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			userId: createdUser.id,
			type: TokenTypes['email-verification'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.tokenHash).toBeTruthy();
	});

	it('queues the verification email', async () => {
		await createPendingUser();

		await service.execute({ email });

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});

	it('rejects a nonexistent user', async () => {
		await expect(service.execute({ email: 'invalid-email@test.com' })).rejects.toBeInstanceOf(NotFoundError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('rejects an already active user', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role: Roles['member'],
			status: UserStatuses['active'],
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(ConflictError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('rejects a request while a valid verification token exists', async () => {
		const createdUser = await createPendingUser();
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			tokenHash: cryptoProvider.hashToken(token),
			userId: createdUser.id,
			type: TokenTypes['email-verification'],
			expiresAt: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(ConflictError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('replaces an expired verification token and queues the email', async () => {
		const createdUser = await createPendingUser();
		const initialToken = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			tokenHash: cryptoProvider.hashToken(initialToken),
			userId: createdUser.id,
			type: TokenTypes['email-verification'],
			expiresAt: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		vi.advanceTimersByTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await service.execute({ email });

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			userId: createdUser.id,
			type: TokenTypes['email-verification'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.tokenHash).toBeTruthy();
		expect(verifyToken.tokenHash).not.toBe(cryptoProvider.hashToken(initialToken));
		expect(await tokensRepository.findByTokenHash(cryptoProvider.hashToken(initialToken))).toBeNull();

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});
});
