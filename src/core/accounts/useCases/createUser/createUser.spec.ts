import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { CreateUserService } from '@/core/accounts/useCases/createUser/CreateUser.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '../../factories/user.factories';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';

let usersRepositoryInMemory: IUsersRepository;
let hashProvider: IHashProvider;
let service: CreateUserService;

const { name, surname, email, password, role, status } = createUserFactory();

describe('Create User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		service = new CreateUserService(usersRepositoryInMemory, hashProvider);
	});

	it('Should be able to create a user', async () => {
		await service.execute({ name, surname, email, password, role, status });

		const verifyUser = await usersRepositoryInMemory.findByEmail(email);

		expect(verifyUser).not.toBeNull();
		expect(verifyUser?.email).toEqual(email);
		expect(verifyUser?.name).toEqual(name);
		expect(verifyUser?.surname).toEqual(surname);
		expect(verifyUser).toHaveProperty('_id');
		expect(verifyUser).toHaveProperty('created_at');
		expect(verifyUser).toHaveProperty('updated_at');
	});

	it('Should not be able to create a user with an existing email', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			status,
			password: await hashProvider.hash(password),
		});

		await expect(service.execute({ name, surname, email, password, role, status })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
});
