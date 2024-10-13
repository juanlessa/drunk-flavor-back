import { User } from '@/core/accounts/entities/user.entity';
import { UsersRepositoryInMemory } from '@/core/accounts/repositories/inMemory/Users.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserProfileService } from './UpdateUserProfile.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { createUserFactory } from '../../factories/user.factories';
import { BcryptHashProvider } from '@/shared/providers/cryptography/implementations/BcryptHash.provider';

let usersRepositoryInMemory: IUsersRepository;
let hashProvider: IHashProvider;
let service: UpdateUserProfileService;

const { name, surname, email, password, role, status } = createUserFactory();
const {
	name: updatedName,
	surname: updatedSurname,
	email: updatedEmail,
	password: updatedPassword,
} = createUserFactory({ surname: 'updated', email: 'updated@example.com', password: 'updated-strong-password' });

describe('Update User', () => {
	beforeEach(async () => {
		usersRepositoryInMemory = new UsersRepositoryInMemory();
		hashProvider = new BcryptHashProvider();
		service = new UpdateUserProfileService(usersRepositoryInMemory, hashProvider);
	});

	it('Should be able to update a user', async () => {
		const createdUser = await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			status,
			password: await hashProvider.hash(password),
		});
		await service.execute({
			id: createdUser._id.toString(),
			name: updatedName,
			surname: updatedSurname,
			email: updatedEmail,
			password: updatedPassword,
		});

		const verifyUser = (await usersRepositoryInMemory.findById(createdUser._id.toString())) as User;

		expect(verifyUser.email).toEqual(updatedEmail);
		expect(verifyUser.name).toEqual(updatedName);
		expect(verifyUser.surname).toEqual(updatedSurname);
		expect(verifyUser).toHaveProperty('_id');
		expect(verifyUser).toHaveProperty('created_at');
	});

	it('Should not be able to update the user email to another email already in use', async () => {
		const createdUser = await usersRepositoryInMemory.create({
			name,
			surname,
			email,
			role,
			status,
			password: await hashProvider.hash(password),
		});
		await usersRepositoryInMemory.create({
			name: updatedName,
			surname: updatedSurname,
			email: updatedEmail,
			role,
			status,
			password: await hashProvider.hash(updatedPassword),
		});

		await expect(
			service.execute({
				id: createdUser._id.toString(),
				name: updatedName,
				surname: updatedSurname,
				email: updatedEmail,
				password: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update a nonexistent user', async () => {
		const nonexistentUserId = new ObjectId().toString();
		await expect(
			service.execute({
				id: nonexistentUserId,
				name: updatedName,
				surname: updatedSurname,
				email: updatedEmail,
				password: updatedPassword,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
