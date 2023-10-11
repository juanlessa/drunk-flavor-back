import { ICreateUser } from '@modules/accounts/dtos/user.dtos';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/inMemory/Users.repository';
import { ROLES } from '@modules/accounts/types/roles';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/Bcrypt.provider';
import AppError from '@shared/errors/AppError';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateUserService } from './CreateUser.service';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';

let usersRepositoryInMemory: UsersRepositoryInMemory;
let createUserService: CreateUserService;
let bcryptProvider: BcryptProvider;

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
		bcryptProvider = new BcryptProvider();
		createUserService = new CreateUserService(usersRepositoryInMemory, bcryptProvider);
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
			password: await bcryptProvider.hash(planPassword)
		});

		await expect(createUserService.execute(createTestUser)).rejects.toEqual(
			new AppError(USER_ERRORS.already_exist)
		);
	});
});
