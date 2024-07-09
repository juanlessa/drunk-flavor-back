import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/modules/accounts/repositories/inMemory/Users.repository';
import { BcryptProvider } from '@/shared/providers/encryption/implementations/Bcrypt.provider';
import { AuthenticateUserService } from '@/modules/accounts/useCases/authenticateUser/AuthenticateUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { createUserFactory } from '@/modules/accounts/container';

let usersRepositoryInMemory: IUsersRepository;
let encryptionProvider: BcryptProvider;
let service: AuthenticateUserService;

const { name, surname, email, password, role } = createUserFactory();

describe('Authenticate User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		encryptionProvider = new BcryptProvider();
		service = new AuthenticateUserService(usersRepositoryInMemory, encryptionProvider);
	});

	it('should be able to authenticate a user', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(password),
			role,
		});

		const result = await service.execute({
			email,
			password,
		});

		expect(result).toHaveProperty('user');
	});

	it('should not be able to authenticate an nonexistent user', async () => {
		await expect(service.execute({ email, password })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to authenticate a user with incorrect password', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			password: await encryptionProvider.hash(password),
			role: role,
		});

		await expect(service.execute({ email: email, password: 'incorrectPassword' })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
});
