import { beforeEach, describe, expect, it } from 'vitest';
import { createUserFactory } from '@/core/accounts/factories/user.factories';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { CredentialsRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Credentials.repository';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { CreatePasswordService } from './CreatePassword.service';

let usersRepository: IUsersRepository;
let credentialsRepository: ICredentialsRepository;
let hashProvider: IHashProvider;
let service: CreatePasswordService;

const password = 'New-password-123456';

describe('CreatePasswordService', () => {
	beforeEach(() => {
		usersRepository = new UsersRepositoryInMemory();
		credentialsRepository = new CredentialsRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		service = new CreatePasswordService(usersRepository, credentialsRepository, hashProvider);
	});

	it('creates the first credential with a hashed password', async () => {
		const user = await usersRepository.create(createUserFactory());

		await service.execute({ userId: user._id.toString(), password });

		const credential = await credentialsRepository.findByUserId(user._id.toString());
		expect(credential).not.toBeNull();
		expect(credential?.password_hash).not.toBe(password);
		expect(await hashProvider.compare(password, credential!.password_hash)).toBe(true);
	});

	it('rejects an account that already has a password', async () => {
		const user = await usersRepository.create(createUserFactory());
		await credentialsRepository.create({ user_id: user._id.toString(), password_hash: 'hash' });

		await expect(service.execute({ userId: user._id.toString(), password })).rejects.toBeInstanceOf(ConflictError);
	});

	it('rejects a nonexistent user', async () => {
		await expect(service.execute({ userId: '507f1f77bcf86cd799439011', password })).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
