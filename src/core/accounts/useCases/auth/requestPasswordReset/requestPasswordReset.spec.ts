import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { RequestPasswordResetService } from './RequestPasswordReset.service';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { Token } from '@/core/accounts/entities/token.entity';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { BadRequestError } from '@/shared/error/error.lib';
import { env } from '@/env';

let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let dateProvider: IDateProvider;
let cryptoProvider: ICryptoProvider;
let emailQueueProvider: MockEmailQueueProvider;
let templateProvider: ITemplateProvider;
let service: RequestPasswordResetService;

const { name, surname, email, role, status } = createUserFactory();

describe('RequestPasswordReset', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		dateProvider = new DayjsProvider();
		cryptoProvider = new NodeCryptoProvider();
		emailQueueProvider = new MockEmailQueueProvider();
		templateProvider = new MjmlProvider();
		service = new RequestPasswordResetService(
			usersRepository,
			tokensRepository,
			dateProvider,
			cryptoProvider,
			emailQueueProvider,
			templateProvider,
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('Should be able to request a password reset', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });

		await service.execute({ email });

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypes['forgot-password'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.token_hash).toBeTruthy();
		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.forgotPassword,
			expect.objectContaining({ to: email }),
		);
	});

	it('Should not be able to request a password reset for a nonexistent user', async () => {
		await expect(service.execute({ email: 'invalid-email@test.com' })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to request a password reset when it has been recently requested', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token_hash: cryptoProvider.hashToken(token),
			user_id: createdUser._id.toString(),
			type: TokenTypes['forgot-password'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should be able to request a password reset after the token expiration time', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });
		const initialToken = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token_hash: cryptoProvider.hashToken(initialToken),
			user_id: createdUser._id.toString(),
			type: TokenTypes['forgot-password'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		vi.advanceTimersByTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await service.execute({ email });

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypes['forgot-password'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.token_hash).toBeTruthy();
		expect(verifyToken.token_hash).not.toBe(cryptoProvider.hashToken(initialToken));
		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
	});
});
