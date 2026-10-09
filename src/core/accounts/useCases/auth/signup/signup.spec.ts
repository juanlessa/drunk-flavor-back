import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { SignupService } from './Signup.service';
import { IUserTokensRepository } from '@/core/accounts/repositories/IUserTokens.repository';
import { UserTokensRepositoryInMemory } from '@/core/accounts/repositories/inMemory/UserTokens.repository';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { NodeCryptoProvider } from '@/shared/providers/cryptography/implementations/NodeCrypto.provider';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { User, UserStatusEnum } from '@/core/accounts/entities/user.entity';
import { TokenTypeEnum, UserToken } from '@/core/accounts/entities/userToken.entity';
import { RolesEnum } from '@/shared/accessControl/roles';
import { ITemplateProvider } from '@/shared/providers/template/ITemplate.provider';
import { MjmlProvider } from '@/shared/providers/template/implementations/Mjml.provider';
import { MockEmailQueueProvider } from '@/shared/providers/queue/email/implementations/MockEmailQueue.provider';
import { EMAIL_JOB_NAMES } from '@/shared/providers/queue/email/emailQueue.constants';

let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let hashProvider: IHashProvider;
let cryptoProvider: ICryptoProvider;
let templateProvider: ITemplateProvider;
let emailQueueProvider: MockEmailQueueProvider;
let service: SignupService;

const { name, surname, email, password } = createUserFactory();

describe('Signup', () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		usersRepository = new UsersRepositoryInMemory();
		userTokensRepository = new UserTokensRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		cryptoProvider = new NodeCryptoProvider();
		templateProvider = new MjmlProvider();
		emailQueueProvider = new MockEmailQueueProvider();
		service = new SignupService(
			usersRepository,
			userTokensRepository,
			new FakeTransactionManager(),
			hashProvider,
			cryptoProvider,
			templateProvider,
			emailQueueProvider,
		);
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
		expect(verifyUser.status).toEqual(UserStatusEnum['pending']);

		const verifyUserToken = (await userTokensRepository.findByUserIdAndType({
			user_id: verifyUser._id.toString(),
			type: TokenTypeEnum['email-verification'],
		})) as UserToken;

		expect(verifyUserToken).not.toBeNull();
		expect(verifyUserToken.token).toBeTruthy();
	});

	it('Should queue the verification email after signup', async () => {
		await service.execute({ name, surname, email, password });

		expect(emailQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(emailQueueProvider.addMock).toHaveBeenCalledWith(
			EMAIL_JOB_NAMES.verification,
			expect.objectContaining({ to: email }),
		);
	});

	it('Should not be able to signup an existent and active user', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role: RolesEnum['member'],
			status: UserStatusEnum['active'],
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ name, surname, email, password })).rejects.toBeInstanceOf(BadRequestError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('Should not be able to signup an existent and pending user', async () => {
		await usersRepository.create({
			name,
			surname,
			email,
			role: RolesEnum['member'],
			status: UserStatusEnum['pending'],
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ name, surname, email, password })).rejects.toBeInstanceOf(BadRequestError);
		expect(emailQueueProvider.addMock).not.toHaveBeenCalled();
	});
});
