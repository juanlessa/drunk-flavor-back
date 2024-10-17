import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { UserTokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/UserTokens.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ForgotPasswordService } from './ForgotPassword.service';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { MockMailerProvider } from '@/shared/providers/mailer/implementations/MockMailer.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { TokenTypeEnum, UserToken } from '@/core/accounts/entities/userToken.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { env } from '@/env';

let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let dateProvider: IDateProvider;
let cryptoProvider: ICryptoProvider;
let mailerProvider: IMailerProvider;
let templateProvider: ITemplateProvider;
let service: ForgotPasswordService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('ForgotPassword', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		usersRepository = new UsersRepositoryInMemory();
		userTokensRepository = new UserTokensRepositoryInMemory();
		dateProvider = new DayjsProvider();
		cryptoProvider = new NodeCryptoProvider();
		mailerProvider = new MockMailerProvider();
		templateProvider = new MjmlProvider();
		service = new ForgotPasswordService(
			usersRepository,
			userTokensRepository,
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

	it('Should be able to request a forgot password', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });

		await service.execute({ email });

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypeEnum['forgot-password'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
		expect(mailerProvider.send).toHaveBeenCalledTimes(1);
	});

	it('Should not be able to request forgot password for a nonexistent user', async () => {
		await expect(service.execute({ email: 'invalid-email@test.com' })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to request forgot password when it has been recently requested', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });
		const token = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await userTokensRepository.create({
			token,
			user_id: createdUser._id.toString(),
			type: TokenTypeEnum['forgot-password'],
		});

		await expect(service.execute({ email })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should be able to request a forgot password after the token expiration time', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, password, role, status });
		const initialToken = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await userTokensRepository.create({
			token: initialToken,
			user_id: createdUser._id.toString(),
			type: TokenTypeEnum['forgot-password'],
		});

		vi.advanceTimersByTime(env.USER_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await service.execute({ email });

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: createdUser._id.toString(),
			type: TokenTypeEnum['forgot-password'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
		expect(verifyUserToken.token).not.toBe(initialToken);
		expect(mailerProvider.send).toHaveBeenCalledTimes(1);
	});
});
