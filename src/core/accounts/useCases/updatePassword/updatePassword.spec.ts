import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { createUserFactory } from '../../factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IUserTokensRepository } from '../../repositories/IUserTokens.repository';
import { ICryptoProvider } from '@/shared/providers/cryptography/ICrypto.provider';
import { env } from '@/env';
import { TokenTypeEnum } from '../../entities/userToken.entity';
import { ObjectId } from 'mongodb';
import { UpdatePasswordService } from './updatePassword.service';

let cryptoProvider: ICryptoProvider;
let hashProvider: IHashProvider;
let usersRepository: IUsersRepository;
let userTokensRepository: IUserTokensRepository;
let service: UpdatePasswordService;

const { name, surname, email, password, role, status } = createUserFactory();
const updatedPassword = 'Test-password-1234';

describe('Update Password', () => {
	beforeEach(async () => {
		hashProvider = new BcryptHashProvider();
		usersRepository = new UsersRepositoryInMemory();
		service = new UpdatePasswordService(usersRepository, hashProvider);
	});

	it('Should be able update the password', async () => {
		const hashedPassword = await hashProvider.hash(password);
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
			password: hashedPassword,
		});

		await service.execute({
			id: createdUser._id.toString(),
			currentPassword: password,
			newPassword: updatedPassword,
		});

		const verifyUser = (await usersRepository.findById(createdUser._id.toString())) as User;

		expect(verifyUser).toBeDefined();
		expect(verifyUser.password).not.toEqual(hashedPassword);
	});

	it('Should not be able to update the password of a nonexistent user', async () => {
		const nonexistentUserId = new ObjectId().toString();

		await expect(
			service.execute({
				id: nonexistentUserId,
				currentPassword: password,
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to update the password using an invalid current password', async () => {
		const hashedPassword = await hashProvider.hash(password);
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
			password: hashedPassword,
		});

		await expect(
			service.execute({
				id: createdUser._id.toString(),
				currentPassword: 'invalid-current-password',
				newPassword: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('Should not be able to update if the new password is the same as the current one', async () => {
		const hashedPassword = await hashProvider.hash(password);
		const createdUser = await usersRepository.create({
			name,
			surname,
			email,
			role,
			status,
			password: hashedPassword,
		});

		await expect(
			service.execute({
				id: createdUser._id.toString(),
				currentPassword: password,
				newPassword: password,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
