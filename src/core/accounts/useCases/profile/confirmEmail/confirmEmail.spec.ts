import { User, UserStatusEnum } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ConfirmEmailService } from './ConfirmEmail.service';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { env } from '@/env';
import { TokenTypeEnum } from '@/core/accounts/entities/userToken.entity';
import { UserTokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/UserTokens.repository';
import { ObjectId } from 'mongodb';

let cryptoProvider: ICryptoProvider;
let hashProvider: IHashProvider;
let dateProvider: IDateProvider;
let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let service: ConfirmEmailService;

const { name, surname, email, password, role } = createUserFactory();

describe('Confirm Email', () => {
	beforeEach(async () => {
		vi.useFakeTimers();

		cryptoProvider = new NodeCryptoProvider();
		dateProvider = new DayjsProvider();
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		userTokensRepository = new UserTokensRepositoryInMemory();
		service = new ConfirmEmailService(usersRepository, userTokensRepository, dateProvider);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('Should be able confirm the email', async () => {
		const hashedPassword = await hashProvider.hash(password);
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatusEnum['pending'],
			password: hashedPassword,
		});
		const token = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await userTokensRepository.create({
			token,
			user_id: createdUser._id.toString(),
			type: TokenTypeEnum['email-verification'],
		});

		await service.execute({
			token,
		});

		const verifyUser = (await usersRepository.findById(createdUser._id.toString())) as User;

		expect(verifyUser).toBeDefined();
		expect(verifyUser.status).toEqual(UserStatusEnum['active']);
	});

	it('should not be able to confirm the email using a nonexisting token', async () => {
		await expect(
			service.execute({
				token: 'non-existing-token',
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to confirm the email using a expired token', async () => {
		const hashedPassword = await hashProvider.hash(password);
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatusEnum['pending'],
			password: hashedPassword,
		});
		const token = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		await userTokensRepository.create({
			token,
			user_id: createdUser._id.toString(),
			type: TokenTypeEnum['email-verification'],
		});

		vi.advanceTimersByTime(env.USER_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await expect(
			service.execute({
				token,
			}),
		).rejects.toBeInstanceOf(BadRequestError);

		const findUserToken = await userTokensRepository.findByToken(token);

		expect(findUserToken).toBeNull();
	});

	it('Should not be able to confirm the email of a nonexistent user', async () => {
		const token = await cryptoProvider.generateToken(env.USER_TOKEN_SIZE);
		const nonexistentUserId = new ObjectId().toString();
		await userTokensRepository.create({
			token,
			user_id: nonexistentUserId,
			type: TokenTypeEnum['email-verification'],
		});

		await expect(
			service.execute({
				token,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
