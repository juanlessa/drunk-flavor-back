import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateUserService } from '@modules/accounts/useCases/createUser/CreateUser.service';
import { BadRequestError } from '@shared/errors/error.lib';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let createUserService: CreateUserService;
let encryptionProvider: BcryptProvider;

// test constants
const planPassword = '123456789';
const email = 'user@test.com';
const name = 'User';
const surname = 'Test';
const role = ROLES.admin;
let createTestUser: ICreateUser = {
	name,
	surname,
	role,
	email,
	password: planPassword
};

describe('Create User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		encryptionProvider = new BcryptProvider();
		createUserService = new CreateUserService(usersRepositoryInMemory, encryptionProvider);
	});

	it('Should be able to create an user', async () => {
		await createUserService.execute(createTestUser);

		const verifyUser = await usersRepositoryInMemory.findByEmail(email);

		expect(verifyUser.email).toEqual(email);
		expect(verifyUser.name).toEqual(name);
		expect(verifyUser.surname).toEqual(surname);
		expect(verifyUser).toHaveProperty('_id');
		expect(verifyUser).toHaveProperty('created_at');
		expect(verifyUser).toHaveProperty('updated_at');
	});

	it('Should not be able to create an user with an existing email', async () => {
		await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			password: await encryptionProvider.hash(planPassword)
		});

		await expect(createUserService.execute(createTestUser)).rejects.toBeInstanceOf(BadRequestError);
	});
});
