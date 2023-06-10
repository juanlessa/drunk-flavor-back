import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppError from '@shared/errors/AppError';
import { IUser } from '@modules/accounts/dtos/UsersDTO';
import { CreateUserService } from './CreateUserService';
import { BcryptProvider } from '@shared/container/providers/encryption/implementations/BcryptProvider';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';

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

describe('Create User', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		bcryptProvider = new BcryptProvider();
		createUserService = new CreateUserService(usersRepositoryMock, bcryptProvider);
	});

	it('Should be able to create a user', async () => {
		const planPassword = '123456789';
		const email = 'user@test.com';
		const name = 'User';

		await createUserService.execute({
			email: email,
			password: planPassword,
			name: name
		});

		expect(usersRepositoryMock.create).toHaveBeenCalledTimes(1);
	});

	it('Should not be able to create a user with existent email', async () => {
		const planPassword = '123456789';
		const encryptedPassword = await bcryptProvider.hash(planPassword);
		const email = 'user@test.com';
		const name = 'User';
		const userAlreadyExist: IUser = {
			id: '6461655e42134e25c583f4ed',
			email: email,
			password: encryptedPassword,
			name: name
		};
		vi.mocked(usersRepositoryMock.findByEmail).mockReturnValue(Promise.resolve(userAlreadyExist));

		await expect(
			createUserService.execute({
				email: email,
				password: planPassword,
				name: name
			})
		).rejects.toEqual(new AppError('User already exists.'));
	});
});
