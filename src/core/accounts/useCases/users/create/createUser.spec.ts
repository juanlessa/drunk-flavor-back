import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { CreateUserService } from './CreateUser.service';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { User } from '@/core/accounts/entities/user.entity';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { DayjsProvider } from '@/shared/providers/date/implementations/Dayjs.provider';
import { TokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Tokens.repository';
import { Token } from '@/core/accounts/entities/token.entity';
import { TokenTypes } from '@/core/accounts/constants/token.constants';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';
import { env } from '@/env';

let usersRepository: IUsersRepository;
let tokensRepository: ITokensRepository;
let credentialsRepository: ICredentialsRepository;
let dateProvider: IDateProvider;
let hashProvider: IHashProvider;
let cryptoProvider: ICryptoProvider;
let templateProvider: ITemplateProvider;
let emailQueueProvider: MockEmailQueueProvider;
let service: CreateUserService;

const { name, surname, email, role } = createUserFactory();
const password = 'Password-12345678';

let admin: Actor;
let member: Actor;
let partner: Actor;

describe('Create User', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		usersRepository = new UsersRepositoryInMemory();
		const persistedAdmin = await usersRepository.create(
			createUserFactory({ email: 'admin-actor@example.com', role: Roles.admin }),
		);
		const persistedMember = await usersRepository.create(
			createUserFactory({ email: 'member-actor@example.com', role: Roles.member }),
		);
		const persistedPartner = await usersRepository.create(
			createUserFactory({ email: 'partner-actor@example.com', role: Roles.partner }),
		);
		admin = { id: persistedAdmin.id, role: persistedAdmin.role };
		member = { id: persistedMember.id, role: persistedMember.role };
		partner = { id: persistedPartner.id, role: persistedPartner.role };
		tokensRepository = new TokensRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		dateProvider = new DayjsProvider();
		hashProvider = new BcryptHashProvider();
		cryptoProvider = new NodeCryptoProvider();
		templateProvider = new MjmlProvider();
		emailQueueProvider = new MockEmailQueueProvider();
		service = new CreateUserService(
			usersRepository,
			tokensRepository,
			credentialsRepository,
			new FakeTransactionManager(),
			dateProvider,
			hashProvider,
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

	it('should be able to create a user when the actor is an admin', async () => {
		await service.execute({ name, surname, email, password, role, actor: admin });

		const verifyUser = (await usersRepository.findByEmail(email)) as User;

		expect(verifyUser).not.toBeNull();
		expect(verifyUser.email).toEqual(email);
		expect(verifyUser.name).toEqual(name);
		expect(verifyUser.surname).toEqual(surname);
		expect(verifyUser.role).toEqual(role);

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			userId: verifyUser.id,
			type: TokenTypes['email-verification'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.tokenHash).toBeTruthy();

		const verifyCredential = await credentialsRepository.findByUserId(verifyUser.id);
		expect(verifyCredential).not.toBeNull();
		expect(await hashProvider.compare(password, verifyCredential!.passwordHash)).toBe(true);

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});

	it('should not be able to create an existing active user', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatuses['active'],
		});

		await expect(service.execute({ name, surname, email, password, role, actor: admin })).rejects.toBeInstanceOf(
			BadRequestError,
		);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('should be able to create a non-active existing user if the email verification token does not exist', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatuses['pending'],
		});

		await service.execute({ name, surname, email, password, role, actor: admin });

		const verifyUser = (await usersRepository.findByEmail(email)) as User;

		expect(verifyUser).not.toBeNull();
		expect(verifyUser.email).toEqual(email);
		expect(verifyUser.name).toEqual(name);
		expect(verifyUser.surname).toEqual(surname);

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			userId: verifyUser.id,
			type: TokenTypes['email-verification'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.tokenHash).toBeTruthy();

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});

	it('should be able to create a non-active existing user if the email verification token is expired', async () => {
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status: UserStatuses['pending'],
		});
		const initialToken = await cryptoProvider.generateToken(env.VERIFICATION_TOKEN_SIZE);
		await tokensRepository.create({
			tokenHash: cryptoProvider.hashToken(initialToken),
			userId: createdUser.id,
			type: TokenTypes['email-verification'],
			expiresAt: dateProvider.addSecondsToCurrentTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS),
		});

		vi.advanceTimersByTime(env.VERIFICATION_TOKEN_EXPIRES_IN_SECONDS * 1000 + 1);

		await service.execute({ name, surname, email, password, role, actor: admin });

		const verifyUser = (await usersRepository.findByEmail(email)) as User;

		expect(verifyUser).not.toBeNull();
		expect(verifyUser.email).toEqual(email);
		expect(verifyUser.name).toEqual(name);
		expect(verifyUser?.surname).toEqual(surname);

		const verifyToken = (await tokensRepository.findByUserIdAndType({
			userId: verifyUser.id,
			type: TokenTypes['email-verification'],
		})) as Token;

		expect(verifyToken).not.toBeNull();
		expect(verifyToken.tokenHash).toBeTruthy();

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});

	it('should not be able to create a user when the actor is a member', async () => {
		await expect(service.execute({ name, surname, email, password, role, actor: member })).rejects.toBeInstanceOf(
			ForbiddenError,
		);

		expect(await usersRepository.findByEmail(email)).toBeNull();
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('should not be able to create a user when the actor is a partner', async () => {
		await expect(service.execute({ name, surname, email, password, role, actor: partner })).rejects.toBeInstanceOf(
			ForbiddenError,
		);

		expect(await usersRepository.findByEmail(email)).toBeNull();
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});
});
