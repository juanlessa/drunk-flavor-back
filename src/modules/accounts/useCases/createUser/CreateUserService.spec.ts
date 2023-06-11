import { IUser } from '@modules/accounts/dtos/UsersDTO';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import AppError from '@shared/errors/AppError';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateUserService } from './CreateUserService';

const usersRepositoryMock = vi.hoisted<IUsersRepository>(() => {
	return {
		create: vi.fn(),
		update: vi.fn(),
		findByEmail: vi.fn(),
		findById: vi.fn()
	};
});
let createUserService: CreateUserService;
let bcryptProvider: BcryptProvider;

// test constants
const planPassword = '123456789';
const email = 'user@test.com';
const name = 'User';
let userTest: IUser;
let encryptedPassword: string;

describe('Create User', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		bcryptProvider = new BcryptProvider();
		createUserService = new CreateUserService(usersRepositoryMock, bcryptProvider);

		// test constants
		encryptedPassword = await bcryptProvider.hash(planPassword);
		userTest = {
			id: '6461655e42134e25c583f4ed',
			email: email,
			password: encryptedPassword,
			name: name
		};
	});

	it('Should be able to create a user', async () => {
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(null as IUser));
		vi.mocked(usersRepositoryMock.create).mockReturnValue(Promise.resolve(userTest));

		await createUserService.execute({
			email: email,
			password: planPassword,
			name: name
		});

		expect(usersRepositoryMock.create).toHaveBeenCalledTimes(1);
	});

	it('Should not be able to create a user with existent email', async () => {
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(userTest));

		await expect(
			createUserService.execute({
				email: email,
				password: planPassword,
				name: name
			})
		).rejects.toEqual(new AppError('User already exists.'));
	});
});
