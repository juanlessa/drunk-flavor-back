import { User, UserStatuses } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ConfirmEmailService } from './ConfirmEmail.service';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { env } from '@/env';
import { TokenTypes } from '@/core/accounts/entities/token.entity';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { ObjectId } from 'mongodb';

let cryptoProvider: ICryptoProvider;
let hashProvider: IHashProvider;
let dateProvider: IDateProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let service: ConfirmEmailService;

const { name, surname, email, password, role } = createUserFactory();

describe('Confirm Email', () => {
	beforeEach(async () => {
		vi.useFakeTimers();

		cryptoProvider = new NodeCryptoProvider();
		dateProvider = new DayjsProvider();
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		service = new ConfirmEmailService(usersRepository, tokensRepository, dateProvider, cryptoProvider);
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
			status: UserStatuses['pending'],
			password: hashedPassword,
		});
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token: cryptoProvider.hashToken(token),
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await service.execute({
			token,
		});

		const verifyUser = (await usersRepository.findById(createdUser._id.toString())) as User;

		expect(verifyUser).toBeDefined();
		expect(verifyUser.status).toEqual(UserStatuses['active']);
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
			status: UserStatuses['pending'],
			password: hashedPassword,
		});
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			token: cryptoProvider.hashToken(token),
			user_id: createdUser._id.toString(),
			type: TokenTypes['email-verification'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		vi.advanceTimersByTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await expect(
			service.execute({
				token,
			}),
		).rejects.toBeInstanceOf(BadRequestError);

		const findToken = await tokensRepository.findByToken(cryptoProvider.hashToken(token));

		expect(findToken).toBeNull();
	});

	it('Should not be able to confirm the email of a nonexistent user', async () => {
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		const nonexistentUserId = new ObjectId().toString();
		await tokensRepository.create({
			token: cryptoProvider.hashToken(token),
			user_id: nonexistentUserId,
			type: TokenTypes['email-verification'],
			expires_at: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await expect(
			service.execute({
				token,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
