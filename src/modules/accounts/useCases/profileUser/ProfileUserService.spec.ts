import { IUser } from '@modules/accounts/dtos/UsersDTO';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import AppError from '@shared/errors/AppError';
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileUserService } from './ProfileUserService';

const usersRepositoryMock = vi.hoisted<IUsersRepository>(() => {
	return {
		create: vi.fn(),
		update: vi.fn(),
		findByEmail: vi.fn(),
		findById: vi.fn()
	};
});

let profileUserService: ProfileUserService;

// test constants
const userTest: IUser = {
	id: '6461655e42134e25c583f4ed',
	email: 'user@test.com',
	password: '123456789',
	name: 'User'
};
const invalidUserTest = null as IUser;

describe('User Profile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		profileUserService = new ProfileUserService(usersRepositoryMock);
	});

	it('should be able to find a user profile', async () => {
		vi.mocked(usersRepositoryMock.findById).mockReturnValue(Promise.resolve(userTest));

		const result = await profileUserService.execute(userTest.id);

		expect(usersRepositoryMock.findById).toHaveBeenCalledTimes(1);
		expect(usersRepositoryMock.findById).toHaveBeenCalledWith(userTest.id);
		expect(result.id).toEqual(userTest.id);
	});

	it('Should not be able to find a nonexistent user profile', async () => {
		vi.mocked(usersRepositoryMock.findById).mockReturnValue(Promise.resolve(invalidUserTest));

		await expect(profileUserService.execute('invalidId')).rejects.toEqual(new AppError('User does not exists!'));
	});
});
