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
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { MockMailerProvider } from '@/shared/providers/mailer/implementations/MockMailer.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { TokenTypes, Token } from '@/core/accounts/entities/token.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { env } from '@/env';

let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let dateProvider: IDateProvider;
let cryptoProvider: ICryptoProvider;
let mailerProvider: IMailerProvider;
let templateProvider: ITemplateProvider;
let service: RequestPasswordResetService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('RequestPasswordReset', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		dateProvider = new DayjsProvider();
		cryptoProvider = new NodeCryptoProvider();
		mailerProvider = new MockMailerProvider();
		templateProvider = new MjmlProvider();
		service = new RequestPasswordResetService(
			usersRepository,
			tokensRepository,
			dateProvider,
			cryptoProvider,
			mailerProvider,
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
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });

		await service.execute({ email });

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypes['forgot-password'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.token).toBeTruthy();
		expect(mailerProvider.send).toHaveBeenCalledTimes(1);
	});

	it('Should not be able to request a password reset for a nonexistent user', async () => {
		await expect(service.execute({ email: 'invalid-email@test.com' })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to request a password reset when it has been recently requested', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token: cryptoProvider.hashToken(token),
			user_id: createdUser._id.toString(),
			type: TokenTypes['forgot-password'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should be able to request a password reset after the token expiration time', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });
		const initialToken = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token: cryptoProvider.hashToken(initialToken),
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
		expect(verifyToken.token).toBeTruthy();
		expect(verifyToken.token).not.toBe(cryptoProvider.hashToken(initialToken));
		expect(mailerProvider.send).toHaveBeenCalledTimes(1);
	});
});
