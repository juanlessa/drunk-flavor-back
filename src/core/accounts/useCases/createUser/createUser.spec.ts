import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { CreateUserService } from '@/core/accounts/useCases/createUser/CreateUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '../../factories/user.factories';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { User, UserStatusEnum } from '../../entities/user.entity';
import { IUserTokensRepository } from '../../repositories/IUserTokens.repository';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { MockMailerProvider } from '@/shared/providers/mailer/implementations/MockMailer.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { UserTokensRepositoryInMemory } from '../../repositories/inMemory/UserTokens.repository';
import { TokenTypeEnum, UserToken } from '../../entities/userToken.entity';
import { env } from '@/env';

let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let dateProvider: IDateProvider;
let hashProvider: IHashProvider;
let cryptoProvider: ICryptoProvider;
let mailerProvider: IMailerProvider;
let templateProvider: ITemplateProvider;
let service: CreateUserService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('Create User', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		usersRepository = new UsersRepositoryInMemory();
		userTokensRepository = new UserTokensRepositoryInMemory();
		dateProvider = new DayjsProvider();
		hashProvider = new BcryptHashProvider();
		cryptoProvider = new NodeCryptoProvider();
		mailerProvider = new MockMailerProvider();
		templateProvider = new MjmlProvider();
		service = new CreateUserService(
			usersRepository,
			userTokensRepository,
			dateProvider,
			hashProvider,
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

	it('should be able to create a user', async () => {
		await service.execute({ name, surname, email, password, role });

		const verifyUser = (await usersRepository.findByEmail(email)) as User;

		expect(verifyUser).not.toBeNull();
		expect(verifyUser.email).toEqual(email);
		expect(verifyUser.name).toEqual(name);
		expect(verifyUser.surname).toEqual(surname);
		expect(verifyUser.role).toEqual(role);

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: verifyUser._id.toString(),
			type: TokenTypeEnum['email-verification'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
		expect(mailerProvider.send).toHaveBeenCalledTimes(1);
	});

	it('should not be able to create an existing active user', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatusEnum['active'],
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ name, surname, email, password, role })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should be able to create a non-active existing user if the email verification token does not exist', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatusEnum['pending'],
			password: await hashProvider.hash(password),
		});

		await service.execute({ name, surname, email, password, role });

		const verifyUser = (await usersRepository.findByEmail(email)) as User;

		expect(verifyUser).not.toBeNull();
		expect(verifyUser.email).toEqual(email);
		expect(verifyUser.name).toEqual(name);
		expect(verifyUser.surname).toEqual(surname);

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: verifyUser._id.toString(),
			type: TokenTypeEnum['email-verification'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
		expect(mailerProvider.send).toHaveBeenCalledTimes(1);
	});

	it('should be able to create a non-active existing user if the email verification token is expired', async () => {
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatusEnum['pending'],
			password: await hashProvider.hash(password),
		});
		const initialToken = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await userTokensRepository.create({
			token: initialToken,
			user_id: createdUser._id.toString(),
			type: TokenTypeEnum['email-verification'],
		});

		vi.advanceTimersByTime(env.USER_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await service.execute({ name, surname, email, password, role });

		const verifyUser = (await usersRepository.findByEmail(email)) as User;

		expect(verifyUser).not.toBeNull();
		expect(verifyUser.email).toEqual(email);
		expect(verifyUser.name).toEqual(name);
		expect(verifyUser?.surname).toEqual(surname);

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: verifyUser._id.toString(),
			type: TokenTypeEnum['email-verification'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
		expect(mailerProvider.send).toHaveBeenCalledTimes(1);
	});
});
