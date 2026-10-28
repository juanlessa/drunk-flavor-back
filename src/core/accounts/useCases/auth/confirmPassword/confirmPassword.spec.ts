import { User } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ConfirmPasswordService } from './ConfirmPassword.service';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { env } from '@/env';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { ObjectId } from 'mongodb';

let cryptoProvider: ICryptoProvider;
let hashProvider: IHashProvider;
let dateProvider: IDateProvider;
let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let credentialsRepository: ICredentialsRepository;
let service: ConfirmPasswordService;

const { name, surname, email, role, status } = createUserFactory();
const password = 'Password-12345678';
const updatedPassword = 'Test-password-1234';

describe('Confirm Password', () => {
	beforeEach(async () => {
		vi.useFakeTimers();

		cryptoProvider = new NodeCryptoProvider();
		dateProvider = new DayjsProvider();
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		tokensRepository = new TokensRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		service = new ConfirmPasswordService(
			usersRepository,
			tokensRepository,
			credentialsRepository,
			dateProvider,
			hashProvider,
			cryptoProvider,
			new FakeTransactionManager(),
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('Should be able to confirm the password', async () => {
		const hashedPassword = await hashProvider.hash(password);
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
		});
		await credentialsRepository.create({
			userId: createdUser.id,
			passwordHash: hashedPassword,
		});
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			tokenHash: cryptoProvider.hashToken(token),
			userId: createdUser.id,
			type: TokenTypes['forgot-password'],
			expiresAt: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await service.execute({
			token,
			password: updatedPassword,
		});

		const verifyUser = (await usersRepository.findById(createdUser.id)) as User;
		expect(verifyUser).toBeDefined();
		expect(verifyUser.sessionVersion).toBe(createdUser.sessionVersion + 1);

		const verifyCredential = await credentialsRepository.findByUserId(createdUser.id);
		expect(verifyCredential).not.toBeNull();
		expect(verifyCredential?.passwordHash).not.toEqual(hashedPassword);
		expect(await hashProvider.compare(updatedPassword, verifyCredential!.passwordHash)).toBe(true);
	});

	it('should not be able to confirm the password using a nonexisting token', async () => {
		await expect(
			service.execute({
				token: 'non-existing-token',
				password: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to confirm the password using a expired token', async () => {
		const createdUser = await usersRepository.create({ name, surname, email, role, status });
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			tokenHash: cryptoProvider.hashToken(token),
			userId: createdUser.id,
			type: TokenTypes['forgot-password'],
			expiresAt: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		vi.advanceTimersByTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await expect(
			service.execute({
				token,
				password: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);

		const findToken = await tokensRepository.findByTokenHash(cryptoProvider.hashToken(token));

		expect(findToken).toBeNull();
	});

	it('Should not be able to confirm the password of a nonexistent user', async () => {
		const token = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		const nonexistentUserId = new ObjectId().toString();
		await tokensRepository.create({
			tokenHash: cryptoProvider.hashToken(token),
			userId: nonexistentUserId,
			type: TokenTypes['forgot-password'],
			expiresAt: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		await expect(
			service.execute({
				token,
				password: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
