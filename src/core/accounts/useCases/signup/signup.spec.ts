import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '../../factories/user.factories';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { SignupService } from './Signup.service';
import { IUserTokensRepository } from '../../repositories/IUserTokens.repository';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { IMailerProvider } from '@/shared/providers/mailer/IMailer.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { UserTokensRepositoryInMemory } from '../../repositories/inMemory/UserTokens.repository';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { MockMailerProvider } from '@/shared/providers/mailer/implementations/MockMailer.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { User, UserRolesEnum, UserStatusEnum } from '../../entities/user.entity';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { TokenTypeEnum, UserToken } from '../../entities/userToken.entity';
import { env } from '@/env';

let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let dateProvider: IDateProvider;
let hashProvider: IHashProvider;
let cryptoProvider: ICryptoProvider;
let mailerProvider: IMailerProvider;
let templateProvider: ITemplateProvider;
let service: SignupService;

const { name, surname, email, password } = createUserFactory();

describe('Signup', () => {
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
		service = new SignupService(
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

	it('Should be able to signup', async () => {
		await service.execute({ name, surname, email, password });

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

	it('Should not be able to signup an existent and active user', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role: UserRolesEnum['member'],
			status: UserStatusEnum['active'],
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ name, surname, email, password })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should be able to signup a non-active existing user if the email verification token does not exist', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role: UserRolesEnum['member'],
			status: UserStatusEnum['pending'],
			password: await hashProvider.hash(password),
		});

		await service.execute({ name, surname, email, password });

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

	it('Should be able to signup a non-active existing user if the email verification token is expired', async () => {
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role: UserRolesEnum['member'],
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

		await service.execute({ name, surname, email, password });

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
